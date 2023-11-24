import { useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  SearchBarComponent,
  SearchableDropdownInput,
} from '../components/SearchBarComponent';
import { AppContext } from '../context';
import { ParkingLot, parkingApi } from '../api/parking_lot';

const NavigationScreen = () => {
  const { setCalloutShown, map } = useContext(AppContext);
  const navigation = useNavigation<any>();
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
    const { id: newCallout, latitude, longitude } = parkingLots[id];
    setCalloutShown(newCallout);
    navigation.navigate('Home');
    map?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    });
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
    backgroundColor: '#f5f5f5',
    marginTop: '15%',
  },
});
