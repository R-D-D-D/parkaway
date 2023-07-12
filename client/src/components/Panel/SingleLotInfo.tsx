import { StyleSheet, Text, View } from "react-native"
import React, { useCallback, useContext } from "react"
import { Image, Button } from "react-native-elements"
import { colors } from "../../global/styles"
import { ParkingLot } from "../../api/parking_lot"
import { AppContext } from "../../context"
import { ActionInfo, parkingActionApi } from "../../api/parking_action"
import { getDistance } from "geolib"
import * as Location from "expo-location"
import { showLongToast } from "../../utils/toast"
import { formatDate } from "../../utils/date"

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
          showLongToast("You seem too far from the parking lot")
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
      }
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
          />
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
    marginVertical: 32,
  },
  avatarContainer: {
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: colors.grey4,
    textAlign: "center",
  },
  avatar: {
    width: 80,
    height: 80,
  },
})
