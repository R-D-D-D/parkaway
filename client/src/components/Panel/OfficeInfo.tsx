import { View, Text, StyleSheet } from "react-native"
import React, { useContext, useState } from "react"
import { AppContext } from "../../context"
import { Button, Image } from "react-native-elements"
import { ParkingLot } from "../../api/parking_lot"
import { colors } from "../../global/styles"
import { subscriptionApi } from "../../api/subscription"
import { showToast } from "../../utils/toast"

interface IProps {
  office: [string, ParkingLot[]] | null
}

const OfficeInfo = (props: IProps) => {
  const { office } = props
  if (office) {
    const officeName = office[1][0].officeName
    const [loading, setLoading] = useState(false)
    const { user, subscriptions } = useContext(AppContext)

    const isSubscribed = subscriptions?.offices.some(
      (o) => o.name === officeName
    )

    const handleSubscribe = async () => {
      if (user && office) {
        try {
          setLoading(true)
          let newOffices: { name: string }[] = []
          if (isSubscribed) {
            if (subscriptions) {
              newOffices = subscriptions.offices.filter(
                (o) => o.name !== officeName
              )
            }
          } else {
            newOffices = subscriptions
              ? [...subscriptions.offices, { name: officeName }]
              : [{ name: officeName }]
          }
          await subscriptionApi.updateSubscription(String(user.id), {
            offices: newOffices,
          })
          showToast({
            title: isSubscribed
              ? "Success"
              : "You will receive notifications about people leaving this office!",
            type: "success",
          })
        } catch (e) {
          console.log(e)
        } finally {
          setLoading(false)
        }
      }
    }

    return (
      <View>
        <Text style={styles.text1}>{office[1][0].officeName}</Text>
        <View style={styles.imgWrapper}>
          <Image
            style={styles.buildingImg}
            source={require("../../../assets/office-building.png")}
          />
          <Text style={styles.text2}>
            Total lots:{" "}
            {office[1].reduce((accum, lot) => lot.totalLots + accum, 0)}
          </Text>
        </View>
        <Button
          title={isSubscribed ? "Unsubscribe" : "Subscribe"}
          buttonStyle={{
            backgroundColor: colors.red,
          }}
          containerStyle={{
            width: 200,
            alignSelf: "center",
          }}
          titleStyle={{ color: "white", marginHorizontal: 20 }}
          onPress={handleSubscribe}
          loading={loading}
        />
      </View>
    )
  }
}

export default OfficeInfo

const styles = StyleSheet.create({
  text1: {
    fontSize: 21,
    paddingLeft: 20,
    paddingTop: 20,
  },
  text2: {
    fontSize: 16,
    paddingVertical: 10,
  },
  buildingImg: {
    width: 70,
    height: 70,
    marginTop: 10,
  },
  imgWrapper: {
    flexDirection: "column",
    alignItems: "center",
  },
})
