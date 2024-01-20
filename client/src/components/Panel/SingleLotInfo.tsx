import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Avatar, ListItem } from "@rneui/themed"
import dayjs from "dayjs"
import * as Location from "expo-location"
import { Timestamp, serverTimestamp } from "firebase/firestore"
import { getDistance } from "geolib"
import React, { useContext, useMemo, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import DashedLine from "react-native-dashed-line"
import Icon, { IconType } from "react-native-dynamic-vector-icons"
import { Button, Dialog, Image } from "react-native-elements"
import { ScrollView } from "react-native-gesture-handler"
import { Easing, Notifier } from "react-native-notifier"
import { ParkingAction, parkingActionApi } from "../../api/parking_action"
import { ParkingLot } from "../../api/parking_lot"
import { AppContext, IUser } from "../../context"
import { SCREEN_HEIGHT, SCREEN_WIDTH, colors } from "../../global/styles"
import useBooking from "../../hooks/useBooking"
import useNotification, { NotificationType } from "../../hooks/useNotification"
import { ChatStackParamList } from "../../navigation"
import { formatDate } from "../../utils/date"
import { openMaps } from "../../utils/openMaps"
import { nameToAbbr } from "../../utils/string"
import { showToast } from "../../utils/toast"

type SingleLotNavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  "Chat"
>

interface IProps {
  parkingLots: ParkingLot[]
  isTestMode: boolean
  parkingActions: ParkingAction[]
  bottomSheetRef: React.RefObject<BottomSheetMethods>
}

const SingleLotInfo = (props: IProps) => {
  // console.log("[SingleLotInfo] props:", props)
  const { parkingLots, isTestMode, parkingActions, bottomSheetRef } = props
  const { user, calloutShown, userLocation, bookings, userBooking, map } =
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

  const hasUserBookedHere = userBooking?.parkingLotId === parkingLot?.id
  const currBookings = useMemo(() => {
    return parkingLot && bookings
      ? bookings.filter((booking) => booking.parkingLotId === parkingLot.id)
      : []
  }, [bookings, parkingLot])

  if (parkingLot) {
    const lotParkingActions = parkingActions.filter(
      (action) => action.parkingLot.id === parkingLot.id
    )
    const { freeLots, isUserParkingHere } = useMemo(
      () => ({
        freeLots:
          parkingLot.totalLots -
          parkingLot.currUsers.length -
          currBookings.length,
        isUserParkingHere:
          parkingLot?.currUsers.find((u) => u.id === user!.id) !== undefined,
      }),
      [parkingLot, currBookings]
    )
    const { isLotFull, isAvailable } = useMemo(
      () => ({
        isLotFull: freeLots === 0,
        isAvailable: freeLots > 0,
      }),
      [freeLots]
    )
    const isUserParked =
      parkingLots.find((lot) =>
        lot.currUsers.map((u) => u.id).includes(user!.id)
      ) !== undefined

    const [expandUserList, setExpandUserList] = useState(false)
    const infoColor = isAvailable
      ? isUserParkingHere
        ? colors.blue1
        : colors.green1
      : colors.red

    const handlePark = async () => {
      if (user) {
        setParking(true)
        if (isUserParkingHere) {
          // means he must have clicked leave button
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
          // try {
          //   await twilioApi.createMsg({
          //     text: `User ${user?.username} wants to swap parking lot with you, go in to the app to check it out!`,
          //     toPhoneNumber: "+19179324155",
          //   })
          // } catch (e) {
          //   console.log(e)
          // }

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

    const showUserList = () => {
      setExpandUserList(true)
      bottomSheetRef.current?.snapToIndex(2)
    }

    const hideUserList = () => {
      setExpandUserList(false)
      bottomSheetRef.current?.snapToIndex(0)
    }

    const getBtnConfig = () => {
      if (isUserParkingHere) {
        // if user is parking here, only action available is leave
        return {
          text: "Leave",
          onClick: handlePark,
        }
      }

      if (isUserParked) {
        // if user is not parking here(since above check fails) but is parked
        return {
          text: "You've parked somewhere else!",
          onClick: () => {},
        }
      }

      if (hasUserBookedHere) {
        // user booked here, so show reserved status
        return {
          text: "Reserved",
          onClick: () => {},
        }
      }

      if (expandUserList) {
        // if user list is displayed for swapping, only action is to Close it
        return {
          text: "Close",
          onClick: hideUserList,
        }
      }

      if (isLotFull) {
        // user is not parked so he can swap
        return {
          text: "Swap",
          onClick: showUserList,
        }
      }

      if (isUserNear || isTestMode) {
        // lot is not full and user is near or is test mode
        return {
          text: "Park",
          onClick: handlePark,
        }
      }

      if (!userBooking) {
        // user havent booked, haven't parked, so he can reserve
        return {
          text: "Reserve",
          onClick: handleBook,
        }
      }

      return {
        text: "",
        onClick: () => {},
      }
    }

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
            <View
              style={StyleSheet.flatten([
                { backgroundColor: infoColor },
                styles.outerContainer,
              ])}
            >
              <View
                style={StyleSheet.flatten([
                  styles.innerContainer,
                  {
                    borderColor: infoColor,
                  },
                ])}
              >
                <View style={styles.headerRow}>
                  <Image
                    source={require("../../../assets/carpark-entrance.jpg")}
                    style={{ width: 50, height: 50, borderRadius: 4 }}
                  />
                  <View>
                    <Text style={{ fontWeight: "bold", width: "100%" }}>
                      {parkingLot.officeName}, {parkingLot.lotName}
                    </Text>
                    <Button
                      type="solid"
                      buttonStyle={{
                        backgroundColor: colors.blue1,
                        padding: 6,
                        borderRadius: 20,
                        width: 120,
                        marginTop: 4,
                      }}
                      icon={
                        <Icon
                          name={"directions"}
                          type={IconType.MaterialCommunityIcons}
                          size={18}
                          color={"white"}
                        />
                      }
                      titleStyle={{
                        fontSize: 14,
                        marginLeft: 6,
                      }}
                      title="Direction"
                      onPress={() => {
                        openMaps({
                          latitude: parkingLot.latitude,
                          longitude: parkingLot.longitude,
                        })
                      }}
                    />
                  </View>
                </View>
                <DashedLine
                  dashLength={2}
                  dashThickness={1}
                  dashColor={colors.grey4}
                />
                <View style={styles.footerRow}>
                  <Text style={{ color: colors.grey2 }}>
                    {isUserParkingHere
                      ? `Parked here since: ${formatDate(
                          lotParkingActions
                            .find((action) => action.user.id === user?.id)
                            ?.createdAt?.toDate() || 0,
                          "HH:mm"
                        )}`
                      : hasUserBookedHere
                      ? `Reservation expires at: ${formatDate(
                          dayjs(userBooking.createdAt?.toDate())
                            .add(10, "minute")
                            .toDate(),
                          "HH:mm"
                        )}`
                      : isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ color: infoColor }}>
                      {parkingLot.totalLots - parkingLot.currUsers.length} slots
                    </Text>
                    <Text> | </Text>
                    <Text> 24 HRs</Text>
                  </View>
                </View>
                {expandUserList && (
                  <ScrollView
                    style={{ height: SCREEN_HEIGHT * 0.65 - 220, marginTop: 8 }}
                  >
                    <>
                      {currBookings.map((booking) => {
                        const isCurrUser =
                          booking.createdAt && booking.user.id === user?.id
                        return (
                          <ListItem
                            topDivider
                            bottomDivider
                            containerStyle={{ padding: 4 }}
                            key={`booking-${booking.createdAt}`}
                          >
                            <Avatar
                              rounded
                              title={nameToAbbr(booking.user.username)}
                              containerStyle={{ backgroundColor: colors.red }}
                              size={32}
                            />
                            <ListItem.Content>
                              <ListItem.Title style={{ fontSize: 16 }}>
                                {isCurrUser
                                  ? "Your reservation expires at"
                                  : "Reserved until"}
                              </ListItem.Title>
                              <ListItem.Subtitle style={{ fontSize: 14 }}>
                                {formatDate(
                                  dayjs(booking.createdAt?.toDate())
                                    .add(10, "minute")
                                    .toDate(),
                                  "HH:mm"
                                )}
                              </ListItem.Subtitle>
                            </ListItem.Content>
                          </ListItem>
                        )
                      })}
                      {parkingLot.currUsers.map((user, idx) => (
                        <ListItem
                          topDivider
                          bottomDivider
                          containerStyle={{ padding: 4 }}
                          key={`user-${user.id}`}
                        >
                          <Avatar
                            rounded
                            title={nameToAbbr(user.username)}
                            containerStyle={{ backgroundColor: "grey" }}
                            size={32}
                          />
                          <ListItem.Content>
                            <ListItem.Title style={{ fontSize: 16 }}>
                              {user.username}
                            </ListItem.Title>
                            <ListItem.Subtitle style={{ fontSize: 14 }}>
                              {`Here since ${getFormattedTime(idx)}`}
                            </ListItem.Subtitle>
                          </ListItem.Content>
                          <Button
                            title={"Swap"}
                            buttonStyle={{
                              backgroundColor: colors.red,
                              padding: 4,
                            }}
                            titleStyle={{
                              color: "white",
                              fontSize: 12,
                            }}
                            onPress={() => handleSwap(user)}
                          />
                        </ListItem>
                      ))}
                    </>
                  </ScrollView>
                )}
              </View>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => getBtnConfig().onClick()}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {getBtnConfig().text}
                </Text>
              </TouchableOpacity>
            </View>
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
  container: {
    textAlign: "center",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
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
  outerContainer: {
    width: "90%",
    borderRadius: 10,
    marginTop: 4,
  },
  innerContainer: {
    borderWidth: 1,
    backgroundColor: "white",
    borderRadius: 10,
    padding: "4%",
  },
  headerRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  footerRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    fontWeight: "bold",
  },
})
