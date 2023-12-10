import { Timestamp, serverTimestamp } from "firebase/firestore"
import React, { useState } from "react"
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { Button, Input } from "react-native-elements"
import { ParkingLot } from "../../api/parking_lot"
import { colors } from "../../global/styles"
import { showToast } from "../../utils/toast"

interface IProps {
  handleCreateParkingLot: (lot: Omit<ParkingLot, "id">) => Promise<void>
  newParkingLot: {
    longitude: number
    latitude: number
  }
}

const EditParkingLots = (props: IProps) => {
  const { handleCreateParkingLot, newParkingLot } = props
  const [parkingLotForm, setParkingLotForm] =
    useState<Omit<ParkingLot, "id">>(null)

  const submit = async () => {
    if (
      parkingLotForm?.totalLots &&
      parkingLotForm?.lotName &&
      parkingLotForm?.officeName &&
      newParkingLot?.latitude &&
      newParkingLot?.longitude
    ) {
      try {
        await handleCreateParkingLot({
          lotName: parkingLotForm.lotName,
          officeName: parkingLotForm.officeName,
          totalLots: parkingLotForm.totalLots,
          latitude: newParkingLot.latitude,
          longitude: newParkingLot.longitude,
          currUsers: [],
          createdAt: serverTimestamp() as Timestamp,
        })
        setParkingLotForm(null)
      } catch (e) {}
    } else {
      showToast({ title: "Please fill in all information", type: "error" })
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView>
        <Text style={styles.text1}>Create a parking lot</Text>
        <View style={styles.input}>
          <Input
            placeholder="Office Name"
            onChangeText={(officeName) =>
              setParkingLotForm({ ...parkingLotForm, officeName })
            }
            autoCapitalize="none"
            value={parkingLotForm?.officeName ?? ""}
          />
          <Input
            placeholder="Lot Name"
            onChangeText={(lotName) =>
              setParkingLotForm({ ...parkingLotForm, lotName })
            }
            autoCapitalize="none"
            value={parkingLotForm?.lotName ?? ""}
          />
          <Input
            placeholder="Total Lot"
            onChangeText={(totalLots) => {
              if (parseInt(totalLots) > 6) {
                showToast({
                  title: "Maximum number of lot is 6",
                  type: "error",
                })
                return
              }
              setParkingLotForm({
                ...parkingLotForm,
                totalLots: totalLots.length > 0 ? parseInt(totalLots) : 0,
              })
            }}
            autoCapitalize="none"
            value={String(parkingLotForm?.totalLots ?? "")}
            keyboardType="numeric"
          />
        </View>
        <Button
          title="Create Parking Lot"
          buttonStyle={{ backgroundColor: colors.red }}
          containerStyle={{
            width: 260,
            alignSelf: "center",
          }}
          titleStyle={{ color: "white", marginHorizontal: 20 }}
          onPress={() => submit()}
        />
      </ScrollView>
    </TouchableWithoutFeedback>
  )
}

export default EditParkingLots

const styles = StyleSheet.create({
  text1: {
    fontSize: 21,
    paddingLeft: 20,
    paddingTop: 20,
  },
  input: {
    paddingHorizontal: 10,
    paddingTop: 6,
  },
})
