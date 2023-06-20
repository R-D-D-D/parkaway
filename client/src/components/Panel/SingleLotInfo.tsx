import { StyleSheet, Text, View } from "react-native"
import React, { useContext } from "react"
import { Image, Button } from "react-native-elements"
import { colors } from "../../global/styles"
import { ParkingLot } from "../../api/parking_lot"
import { AppContext } from "../../context"
import { parkingActionApi } from "../../api/parking_action"

interface IProps {
  calloutShown: number | null
  parkingLots: ParkingLot[]
  resetParkingLots: () => Promise<void>
}
const SingleLotInfo = (props: IProps) => {
  console.log("[SingleLotInfo] props:", props)
  const { calloutShown, parkingLots, resetParkingLots } = props
  const { user } = useContext(AppContext)

  const parkingLot = parkingLots[calloutShown]
  const isUserParkingHere =
    parkingLot?.currUsers.find((u) => u.id === user.id) !== undefined

  const handlePark = async () => {
    await parkingActionApi.createParkingAction({
      userId: user.id,
      parkingLotId: parkingLot.id,
      isPark: !isUserParkingHere,
    })
    await resetParkingLots()
  }

  return (
    <>
      {parkingLot && (
        <View style={styles.container}>
          <Text style={styles.text1}>Lot 1</Text>

          <View style={styles.avatarRowContainer}>
            {[...Array(parkingLot.freeLots).keys()].map((idx) => (
              <View style={styles.avatarContainer}>
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
                <View style={styles.avatarContainer}>
                  <Image
                    source={require("../../../assets/man.png")}
                    style={styles.avatar}
                  />
                  <Text>Mark</Text>
                  <Text style={styles.timeText}>Here since 16:45</Text>
                </View>
              )
            )}
          </View>
          <Button
            title={
              parkingLot.freeLots === 0
                ? isUserParkingHere
                  ? "Leave"
                  : "Unavailable"
                : "Park"
            }
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
    fontSize: 12,
    color: colors.grey4,
  },
  avatar: {
    width: 80,
    height: 80,
  },
})
