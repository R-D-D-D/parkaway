import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ParkingLot, parkingApi } from "../api/parking_lot";
import {
  SearchBarComponent,
  SearchableDropdownInput,
} from "../components/SearchBarComponent";
import { openGoogleMaps } from "../utils/googlemaps";

const NavigationScreen = () => {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);

  const fetchData = async () => {
    const res = await parkingApi.getParkingLots();
    setParkingLots(res);
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleOpenGoogleMaps = ({ id }: SearchableDropdownInput) => {
    // id is the index
    const { latitude, longitude } = parkingLots[id];
    openGoogleMaps({ latitude, longitude });
  };

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
  );
};

export default NavigationScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    marginTop: "15%",
  },
});
