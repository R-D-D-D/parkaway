import { StyleSheet, Text, View } from "react-native"
import React from "react"
import Androw from "react-native-androw"
import RNBounceable from "@freakycoder/react-native-bounceable"
import { SCREEN_WIDTH, colors } from "../global/styles"
import Icon, { IconType } from "react-native-dynamic-vector-icons"
import { formatDate } from "../utils/date"
import { ParkingAction } from "../api/parking_action"

interface IProps {
  parkingAction: ParkingAction
  leavingAction?: ParkingAction
}

const ParkingDurationDisplay = (props: IProps) => {
  const { parkingAction, leavingAction } = props
  if (parkingAction) {
    return (
      <Androw style={styles.shadowStyle}>
        <RNBounceable style={styles.cardContainer}>
          <View style={styles.dateDisplayContainer}>
            <Icon
              name={"alpha-p"}
              type={IconType.MaterialCommunityIcons}
              size={40}
              color={"#505e80"}
            />
            <View>
              <Text style={styles.title}>
                {parkingAction.parkingLot.lotName}
              </Text>
              <Text style={styles.subTitle}>
                {parkingAction.createdAt &&
                  formatDate(parkingAction.createdAt?.toDate(), "MM/dd")}
              </Text>
            </View>
          </View>
          <View style={styles.timeDisplayContainer}>
            <View style={styles.time}>
              <View style={styles.innerCircle}></View>
              <Text style={{ fontSize: 12 }}>
                {parkingAction.createdAt &&
                  formatDate(parkingAction.createdAt?.toDate(), "HH:mm")}
              </Text>
            </View>
            <View style={styles.verticalLineWrapper}>
              <View style={styles.verticalLine} />
            </View>
            {leavingAction && (
              <View style={styles.time}>
                <View style={styles.circle}></View>
                <Text style={{ fontSize: 12 }}>
                  {leavingAction.createdAt &&
                    formatDate(leavingAction?.createdAt.toDate(), "HH:mm")}
                </Text>
              </View>
            )}
          </View>
        </RNBounceable>
      </Androw>
    )
  } else {
    return null
  }
}

export default ParkingDurationDisplay

const styles = StyleSheet.create({
  cardContainer: {
    height: 70,
    width: SCREEN_WIDTH * 0.86,
    borderRadius: 15,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateDisplayContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  timeDisplayContainer: {
    flexDirection: "column",
    width: 60,
    marginRight: 20,
    marginTop: 16,
  },
  time: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 1,
  },
  title: {
    fontSize: 18,
    lineHeight: 18,
    letterSpacing: 0,
  },
  subTitle: {
    fontSize: 12,
    marginTop: 2,
    color: colors.grey2,
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: 1.5,
    borderColor: "red",
    backgroundColor: "rgba(0, 0, 0, 0)",
    marginRight: 4,
    // position: absolute;
    // top:0;
    // left:0;
    // pointer-events:none;
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,

    // borderStyle: "solid",
    // borderWidth: 2,
    // borderColor: "red",
    backgroundColor: "red",
  },
  verticalLine: {
    borderLeftWidth: 2,
    borderStyle: "solid",
    borderColor: "red",
    height: 6,
    position: "absolute",
    left: 4,
    top: 0,
  },
  verticalLineWrapper: {
    height: 6,
  },
  shadowStyle: {
    shadowRadius: 8,
    shadowOpacity: 0.2,
    shadowColor: "#757575",
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
})
