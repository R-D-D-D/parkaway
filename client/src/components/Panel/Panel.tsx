import { Text, StyleSheet, View } from "react-native"
import React, { Component } from "react"
import { colors, parameters } from "../../global/styles"
import AllLotsInfo from "./AllLotsInfo"
import SingleLotInfo from "./SingleLotInfo"

export enum PanelType {
  AllLotsInfo = 0,
  SingleLotInfo,
}

interface IPanelProps {
  type: PanelType
}

const Panel = (props: IPanelProps) => {
  const { type } = props
  const isAllLotsInfo = type === PanelType.AllLotsInfo
  return (
    <View style={styles.container}>
      {isAllLotsInfo ? <AllLotsInfo /> : <SingleLotInfo />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 300,
    backgroundColor: colors.white,
    position: "absolute",
    bottom: 0,
  },
})

export default Panel
