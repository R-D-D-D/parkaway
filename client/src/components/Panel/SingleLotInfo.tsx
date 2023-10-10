import { StyleSheet, Text, View, Alert } from "react-native"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { Image, Button, Dialog } from "react-native-elements"
import { SCREEN_HEIGHT, SCREEN_WIDTH, colors } from "../../global/styles"
import { ParkingLot } from "../../api/parking_lot"
import { AppContext, IUser, NotificationType } from "../../context"
import { ActionInfo, parkingActionApi } from "../../api/parking_action"
import { getDistance } from "geolib"
import * as Location from "expo-location"
import { showToast } from "../../utils/toast"
import { formatDate } from "../../utils/date"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../navigation"
import { useNavigation } from "@react-navigation/native"
import { twilioApi } from "../../api/twilio"
import {
  query,
  collection,
  orderBy,
  onSnapshot,
  limit,
  setDoc,
  doc,
  where,
  or,
  getDocs,
  addDoc,
  getDoc,
  and,
} from "firebase/firestore"
import { db } from "../../firebase"
import { Notifier, Easing } from "react-native-notifier"

type SingleLotNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Chat"
>

interface IProps {
  calloutShown: number | null
  parkingLots: ParkingLot[]
  resetParkingLots: () => Promise<void>
  isTestMode: boolean
  parkingActions: ActionInfo[]
}

const SingleLotInfo = (props: IProps) => {
  // console.log("[SingleLotInfo] props:", props)
  const {
    calloutShown,
    parkingLots,
    resetParkingLots,
    isTestMode,
    parkingActions,
  } = props
  const { user } = useContext(AppContext)
  const [parking, setParking] = useState(false)
  const navigation = useNavigation<SingleLotNavigationProp>()
  const [visible, setVisible] = useState(false)
  const [otherUser, setOtherUser] = useState<IUser | null>(null)

  const parkingLot = parkingLots[calloutShown]
  const lotParkingActions = parkingActions.filter(
    (action) => action.parkingLotId === parkingLot.id
  )
  const isUserParkingHere =
    parkingLot?.currUsers.find((u) => u.id === user.id) !== undefined
  const isUserParked =
    parkingLots.find((lot) =>
      lot.currUsers.map((u) => u.id).includes(user?.id)
    ) !== undefined

  const handlePark = async () => {
    if (user) {
      setParking(true)
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
          userId: user.id,
          parkingLotId: parkingLot.id,
          isPark: !isUserParkingHere,
        })
        await resetParkingLots()
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
    try {
      // await twilioApi.createMsg({
      //   text: `User ${user?.username} wants to swap parking lot with you, go in to the app to check it out!`,
      //   toPhoneNumber: "+19179324155",
      // })
      await addDoc(collection(db, "notifications"), {
        title: "You have a swap request!",
        description: `User ${user?.username} wants to swap parking lot with you, chat with him now'`,
        receiveUser: otherUser,
        originUser: user,
        isChecked: false,
        type: NotificationType.SWAP_REQUEST,
      })
      setOtherUser(null)
      navigation.navigate("ChatStack", {
        screen: "Chat",
        params: { otherUser: otherUser },
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

  const getBtnConfig = useCallback(() => {
    if (isUserParkingHere) {
      return {
        text: "Leave",
        disabled: false,
      }
    } else if (parkingLot.freeLots === 0) {
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
      return {
        text: "Park",
        disabled: false,
      }
    }
  }, [parkingLots, calloutShown, user])

  const getFormattedTime = (idx: number) => {
    const parkingAction = lotParkingActions.find(
      (action) => action.userId === parkingLot.currUsers[idx].id
    )
    if (parkingAction) {
      const date = new Date(parkingAction.createdAt * 1000)
      return formatDate(date, "MM/dd HH:mm")
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
            {[...Array(parkingLot.freeLots).keys()].map((idx) => (
              <View style={styles.avatarContainer} key={`empty-${idx}`}>
                <Image
                  source={require("../../../assets/grey-avatar.png")}
                  style={styles.avatar}
                />
                <Text>Available</Text>
                <Text style={styles.timeText}></Text>
              </View>
            ))}
            {[...Array(parkingLot.totalLots - parkingLot.freeLots).keys()].map(
              (idx) => (
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
                  {parkingLot.freeLots === 0 && (
                    <Button
                      title={"Swap"}
                      onPress={() => handleSwap(parkingLot.currUsers[idx])}
                      buttonStyle={{
                        backgroundColor: colors.red,
                      }}
                    />
                  )}
                </View>
              )
            )}
          </View>
          <Button
            title={getBtnConfig().text}
            buttonStyle={{
              backgroundColor:
                parkingLot.freeLots === 0 && !isUserParkingHere
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
        </View>
      )}
    </>
  )
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
