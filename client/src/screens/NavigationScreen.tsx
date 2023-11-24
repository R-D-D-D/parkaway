import React, { useEffect, useState } from "react";
import { ParkingLot, parkingApi } from "../api/parking_lot";
import { SearchBarComponent } from "../components/SearchBarComponent";

const NavigationScreen = () => {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);

  const fetchData = async () => {
    const res = await parkingApi.getParkingLots();
    setParkingLots(res);
  };

  useEffect(() => {
    void fetchData();
  }, []);

  return (
    <SearchBarComponent
      data={parkingLots.map(({ officeName, lotName }, index) => ({
        id: index,
        name: `${officeName} | ${lotName}`,
      }))}
      onItemSelect={(item) => alert(JSON.stringify(item))}
    />
  );
};

export default NavigationScreen;
