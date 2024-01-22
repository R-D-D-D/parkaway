import { useNavigation } from "@react-navigation/native"
import React, { useContext } from "react"
import { StyleSheet, View } from "react-native"
import {
  SearchBarComponent,
  SearchableDropdownInput,
} from "../components/SearchBarComponent"
import { AppContext } from "../context"
import { LAT_DELTA, LNG_DELTA } from "./HomeScreen"

const SearchScreen = () => {
  const { setCalloutShown, map, parkingLots } = useContext(AppContext)
  const navigation = useNavigation<any>()

  const handleOpenGoogleMaps = ({ id }: SearchableDropdownInput) => {
    // id is the index
    const { id: newCallout, latitude, longitude } = parkingLots[id]
    setCalloutShown(newCallout)
    navigation.navigate("Home")
    map?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: LAT_DELTA,
      longitudeDelta: LNG_DELTA,
    })
  }

  return (
    <View style={styles.container}>
      <SearchBarComponent
        data={parkingLots.map(({ officeName, lotName }, index) => ({
          id: index,
          name: `${officeName} | ${lotName}`,
        }))}
        onItemSelect={handleOpenGoogleMaps}
      />
    </View>
  )
}

export default SearchScreen

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    marginTop: "15%",
    position: "relative",
  },
})
