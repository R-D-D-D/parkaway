import { SCREEN_HEIGHT } from "@gorhom/bottom-sheet"
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { Button, ListItem } from "@rneui/themed"
import React, { useContext, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import DashedLine from "react-native-dashed-line"
import { Avatar, Image } from "react-native-elements"
import { ScrollView } from "react-native-gesture-handler"
import { AppContext } from "../../context"
import { colors } from "../../global/styles"

interface IProps {
  bottomSheetRef: React.RefObject<BottomSheetMethods>
}

const ParkingLotInfoCard = (props: IProps) => {
  const { bottomSheetRef } = props
  const { calloutShown, hasUserBooked, parkingLots } = useContext(AppContext)
  const parkingLot = parkingLots.find((p) => p.id === calloutShown)
  if (parkingLot) {
    const [expandUserList, setExpandUserList] = useState(false)
    const isAvailable = parkingLot.currUsers.length !== parkingLot.totalLots
    const infoColor = isAvailable ? colors.green1 : colors.red

    const showUserList = () => {
      setExpandUserList(true)
      bottomSheetRef.current?.snapToIndex(2)
    }

    const hideUserList = () => {
      setExpandUserList(false)
      bottomSheetRef.current?.snapToIndex(0)
    }

    return (
      <View
        style={StyleSheet.flatten([
          { backgroundColor: infoColor },
          styles.outerContainer,
        ])}
        onPress={() => console.log("clicked")}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout
          console.log(x, y, width, height)
        }}
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
              style={{ width: 40, height: 40, borderRadius: 4 }}
            />
            <View>
              <Text style={{ fontWeight: "bold" }}>
                {parkingLot.officeName}, {parkingLot.lotName}
              </Text>
              <Text style={{ color: colors.grey2, lineHeight: 22 }}>
                12 minutes e-clearance
              </Text>
            </View>
          </View>
          <DashedLine
            dashLength={2}
            dashThickness={1}
            dashColor={colors.grey4}
          />
          <View style={styles.footerRow}>
            <Text style={{ color: colors.grey2 }}>
              {isAvailable ? "Available" : "Unavailable"}
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
                <ListItem
                  topDivider
                  bottomDivider
                  containerStyle={{ padding: 4 }}
                >
                  <Avatar
                    rounded
                    title="JD"
                    containerStyle={{ backgroundColor: "grey" }}
                    size={32}
                  />
                  <ListItem.Content>
                    <ListItem.Title style={{ fontSize: 16 }}>
                      John Doe
                    </ListItem.Title>
                    <ListItem.Subtitle style={{ fontSize: 14 }}>
                      President
                    </ListItem.Subtitle>
                  </ListItem.Content>
                  <Button
                    title={"Swap"}
                    size="sm"
                    buttonStyle={{
                      backgroundColor: colors.red,
                      padding: 4,
                    }}
                    titleStyle={{
                      color: "white",
                      fontSize: 12,
                    }}
                  />
                </ListItem>
              </>
            </ScrollView>
          )}
        </View>
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            isAvailable
              ? console.log("avai")
              : expandUserList
              ? hideUserList()
              : showUserList()
          }
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {isAvailable ? "Park" : expandUserList ? "Close" : "Swap"}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}

export default ParkingLotInfoCard

const styles = StyleSheet.create({
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
    justifyContent: "flex-start",
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
