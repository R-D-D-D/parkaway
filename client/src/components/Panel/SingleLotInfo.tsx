import { StyleSheet, Text, View, Alert } from "react-native"
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Image, Button, Dialog } from "react-native-elements"
import { SCREEN_HEIGHT, SCREEN_WIDTH, colors } from "../../global/styles"
import { ParkingLot } from "../../api/parking_lot"
import { AppContext, IUser } from "../../context"
import { ParkingAction, parkingActionApi } from "../../api/parking_action"
import { getDistance } from "geolib"
import * as Location from "expo-location"
import { showToast } from "../../utils/toast"
import { formatDate } from "../../utils/date"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { ChatStackParamList, RootStackParamList } from "../../navigation"
import { useNavigation } from "@react-navigation/native"
import { twilioApi } from "../../api/twilio"
import { serverTimestamp, Timestamp } from "firebase/firestore"
import { Notifier, Easing } from "react-native-notifier"
import useNotification, { NotificationType } from "../../hooks/useNotification"
import Icon, { IconType } from "react-native-dynamic-vector-icons"
import useBooking from "../../hooks/useBooking"
import { CountdownTimer, FlipNumber } from "react-native-flip-countdown-timer"
import dayjs from "dayjs"

type SingleLotNavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  "Chat"
>

interface IProps {
  parkingLots: ParkingLot[]
  isTestMode: boolean
  parkingActions: ParkingAction[]
}

const SingleLotInfo = (props: IProps) => {
  // console.log("[SingleLotInfo] props:", props)
  const { parkingLots, isTestMode, parkingActions } = props
  const { user, calloutShown, userLocation, bookings, hasUserBooked } =
    useContext(AppContext)
  const [parking, setParking] = useState(false)
  const navigation = useNavigation<SingleLotNavigationProp>()
  const [visible, setVisible] = useState(false)
  const [confirmLeavingVisible, setConfirmLeavingVisible] = useState(false)
  const [otherUser, setOtherUser] = useState<IUser | null>(null)
  const { broadcastLeavingAction, createSwapRequestNotification } =
    useNotification()
  const { createBooking } = useBooking()

  const parkingLot = parkingLots.find((lot) => lot.id === calloutShown)
  const bookingsLength = bookings ? bookings.length : 0
  const isUserNear = useMemo(() => {
    if (parkingLot) {
      const { latitude, longitude } = userLocation
      return (
        getDistance(
          { latitude, longitude },
          {
            latitude: parkingLot.latitude,
            longitude: parkingLot.longitude,
          }
        ) < 20
      )
    } else {
      return false
    }
  }, [userLocation])

  const currBookings = useMemo(() => {
    return parkingLot && bookings
      ? bookings.filter((booking) => booking.parkingLotId === parkingLot.id)
      : []
  }, [bookings, parkingLot])

  if (parkingLot) {
    const lotParkingActions = parkingActions.filter(
      (action) => action.parkingLot.id === parkingLot.id
    )
    const freeLots = parkingLot.totalLots - parkingLot.currUsers.length
    const isUserParkingHere =
      parkingLot?.currUsers.find((u) => u.id === user!.id) !== undefined
    const isUserParked =
      parkingLots.find((lot) =>
        lot.currUsers.map((u) => u.id).includes(user!.id)
      ) !== undefined

    const handlePark = async () => {
      if (user) {
        setParking(true)
        if (isUserParkingHere) {
          broadcastLeavingAction(user, parkingLot, NotificationType.USER_LEFT)
        }
        if (!isTestMode && !isUserParkingHere) {
          const {
            coords: { latitude, longitude },
          } = await Location.getCurrentPositionAsync({})

          const distance = getDistance(
            { latitude, longitude },
            {
              latitude: parkingLot.latitude,
              longitude: parkingLot.longitude,
            }
          )
          if (distance > 20) {
            showToast({
              title: "You seem too far from the parking lot",
              type: "warn",
            })
            setParking(false)
            return
          }
        }
        try {
          await parkingActionApi.createParkingAction({
            user: user,
            parkingLot: parkingLot,
            isPark: !isUserParkingHere,
            createdAt: serverTimestamp() as Timestamp,
          })
        } catch (e) {
          console.log(e)
        } finally {
          setParking(false)
        }
      }
    }

    const handleSwap = async (otherUser: IUser) => {
      setVisible(true)
      setOtherUser(otherUser)
    }

    const handleNotify = async () => {
      if (user && otherUser) {
        try {
          await twilioApi.createMsg({
            text: `User ${user?.username} wants to swap parking lot with you, go in to the app to check it out!`,
            toPhoneNumber: "+19179324155",
          })
          createSwapRequestNotification(user, otherUser)
          setOtherUser(null)
          navigation.navigate("ChatStack", {
            screen: "Chat",
            params: { otherUser, fromMain: true },
          })

          Notifier.showNotification({
            title: "Success!",
            description: "He's got your request, text him now!",
            duration: 0,
            showAnimationDuration: 800,
            showEasing: Easing.bounce,
            hideOnPress: true,
            queueMode: "standby",
          })
        } catch (e) {
          console.log(e)
          setOtherUser(null)
        }
      }
    }

    const handleLeaving = async () => {
      if (user) {
        try {
          await broadcastLeavingAction(
            user,
            parkingLot,
            NotificationType.USER_LEAVING
          )
          showToast({ title: "Success!", type: "success" })
        } catch (e) {
          console.log(e)
        }
      }
    }

    const handleBook = async () => {
      if (user) {
        await createBooking(user, parkingLot)
      }
    }

    const getBtnConfig = useCallback(() => {
      if (isUserParkingHere) {
        return {
          text: "Leave",
          disabled: false,
        }
      } else if (freeLots === 0) {
        return {
          text: "Unavailable",
          disabled: true,
        }
      } else if (isUserParked) {
        return {
          text: "Park",
          disabled: true,
        }
      } else {
        if (isUserNear || isTestMode) {
          return {
            text: "Park",
            disabled: false,
          }
        } else {
          return {
            text: "Park",
            disabled: true,
          }
        }
      }
    }, [parkingLots, calloutShown, user, isUserNear, isTestMode])

    const getFormattedTime = (idx: number) => {
      const parkingAction = lotParkingActions.find(
        (action) => action.user.id === parkingLot.currUsers[idx].id
      )
      if (parkingAction && parkingAction.createdAt) {
        return formatDate(parkingAction.createdAt.toDate(), "MM/dd HH:mm")
      } else {
        return null
      }
    }

    return (
      <>
        {parkingLot && (
          <View style={styles.container}>
            <Text style={styles.text1}>
              {parkingLot.officeName} Lot {parkingLot.lotName}
            </Text>

            <View style={styles.avatarRowContainer}>
              {[...Array(freeLots - currBookings.length).keys()].map((idx) => (
                <View style={styles.avatarContainer} key={`empty-${idx}`}>
                  <Image
                    source={require("../../../assets/grey-avatar.png")}
                    style={styles.avatar}
                  />
                  <Text>Available</Text>
                  <Text style={styles.timeText}></Text>
                </View>
              ))}
              {currBookings.map((booking) => (
                <View
                  style={styles.avatarContainer}
                  key={`booking-${booking.createdAt}`}
                >
                  <Image
                    source={require("../../../assets/man.png")}
                    style={styles.avatar}
                  />
                  {booking.createdAt &&
                    (`${booking.user.id}` === `${user?.id}` ? (
                      <>
                        <Text>Booking expires</Text>
                        <Text style={styles.timeText}></Text>
                        <Text>
                          {formatDate(
                            dayjs(booking.createdAt.toDate())
                              .add(10, "minute")
                              .toDate(),
                            "HH:mm"
                          )}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text>Booked until</Text>
                        <Text style={styles.timeText}></Text>
                        <Text>
                          {formatDate(
                            dayjs(booking.createdAt.toDate())
                              .add(10, "minute")
                              .toDate(),
                            "HH:mm"
                          )}
                        </Text>
                      </>
                    ))}
                </View>
              ))}
              {[...Array(parkingLot.currUsers.length).keys()].map((idx) => (
                <View style={styles.avatarContainer} key={`occupied-${idx}`}>
                  <Image
                    source={require("../../../assets/man.png")}
                    style={styles.avatar}
                  />
                  <Text>{parkingLot.currUsers[idx].username}</Text>
                  <Text style={styles.timeText}>
                    Here since{"\n"}
                    {getFormattedTime(idx)}
                  </Text>
                  {freeLots === 0 && !isUserParkingHere && (
                    <Button
                      title={"Swap"}
                      onPress={() => handleSwap(parkingLot.currUsers[idx])}
                      buttonStyle={{
                        backgroundColor: colors.red,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
            {(!isUserNear || isTestMode) &&
              !isUserParked &&
              !hasUserBooked &&
              freeLots - bookingsLength > 0 && (
                <Button
                  title={"Book"}
                  onPress={() => handleBook()}
                  buttonStyle={{
                    backgroundColor: colors.red,
                  }}
                  containerStyle={{
                    width: 200,
                    alignSelf: "center",
                  }}
                />
              )}
            {(isUserParkingHere || freeLots > 0) && (
              <View
                style={{
                  position: "relative",
                }}
              >
                <Button
                  title={getBtnConfig().text}
                  buttonStyle={{
                    backgroundColor:
                      freeLots === 0 && !isUserParkingHere
                        ? colors.grey4
                        : colors.red,
                  }}
                  containerStyle={{
                    width: 200,
                    alignSelf: "center",
                  }}
                  titleStyle={{ color: "white", marginHorizontal: 20 }}
                  onPress={() => handlePark()}
                  disabled={getBtnConfig().disabled}
                  loading={parking}
                />
                {isUserParkingHere && (
                  <View style={{ position: "absolute", top: 0, right: 40 }}>
                    <Button
                      icon={
                        <Icon
                          name={"bell-ring-outline"}
                          type={IconType.MaterialCommunityIcons}
                          size={24}
                        />
                      }
                      buttonStyle={{ borderColor: colors.grey10 }}
                      type="clear"
                      onPress={() => setConfirmLeavingVisible(true)}
                    />
                  </View>
                )}
              </View>
            )}
            <Dialog
              isVisible={visible}
              onBackdropPress={() => setVisible(!visible)}
            >
              <Dialog.Title title="By confirming the person will receive a notification" />
              <Dialog.Actions>
                <Dialog.Button
                  title="CONFIRM"
                  onPress={async () => {
                    setVisible(!visible)
                    await handleNotify()
                  }}
                />
                <Dialog.Button
                  title="CANCEL"
                  onPress={() => setVisible(!visible)}
                />
              </Dialog.Actions>
            </Dialog>
            <Dialog
              isVisible={confirmLeavingVisible}
              onBackdropPress={() => setConfirmLeavingVisible(false)}
            >
              <Dialog.Title title="By confirming everyone will receive a notification that you are leaving" />
              <Dialog.Actions>
                <Dialog.Button
                  title="CONFIRM"
                  onPress={async () => {
                    setConfirmLeavingVisible(false)
                    await handleLeaving()
                  }}
                />
                <Dialog.Button
                  title="CANCEL"
                  onPress={() => setConfirmLeavingVisible(false)}
                />
              </Dialog.Actions>
            </Dialog>
          </View>
        )}
      </>
    )
  }
}

export default SingleLotInfo

const styles = StyleSheet.create({
  container: {},
  text1: {
    fontSize: 21,
    paddingLeft: 20,
    paddingTop: 20,
  },
  avatarRowContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: SCREEN_HEIGHT * 0.35 * 0.05,
  },
  avatarContainer: {
    alignItems: "center",
  },
  timeText: {
    fontSize: 10,
    color: colors.grey4,
    textAlign: "center",
  },
  avatar: {
    width: SCREEN_WIDTH / 6,
    height: SCREEN_WIDTH / 6,
  },
})
