import { useIsFocused } from '@react-navigation/core';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import MapView, {
  Callout,
  MapMarker,
  MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
  Polygon,
} from 'react-native-maps';
import { ParkingLot, parkingApi } from '../api/parking_lot';
import FloatingMenuBtn from '../components/FloatingMenuButton';
import CustomMarker from '../components/Marker';
import Panel, { PanelType } from '../components/Panel/Panel';
import Spinner from '../components/Spinner';
import { AppContext } from '../context';
import { mapStyle } from '../global/mapStyle';
import {
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  colors,
  parameters,
} from '../global/styles';
import { RootStackParamList } from '../navigation';
import { openMaps } from '../utils/openMaps';
import { showToast } from '../utils/toast';

export const LAT_DELTA = 0.005;
export const LNG_DELTA = 0.0025;

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Main'
>;

const HomeScreen = ({ navigation }) => {
  // coordinate of the current user
  const [latLng, setLatLng] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  let markerRefs = useRef<Map<string, MapMarker>>(new Map());
  const {
    user,
    parkingLots,
    calloutShown,
    setCalloutShown,
    map,
    setMap,
    setUserLocation,
  } = useContext(AppContext);
  // const navigation = useNavigation<HomeScreenNavigationProp>()
  const isFocused = useIsFocused();
  const [newParkingLot, setNewParkingLot] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const dataReady = true;
  const [officeSelected, setOfficeSelected] = useState<
    [string, ParkingLot[]] | null
  >(null);
  // const [userLocation, setUserLocation] = useState<LatLng>({
  //   longitude: 0,
  //   latitude: 0,
  // })

  const panelDisplayed: PanelType = officeSelected
    ? PanelType.OFFICE_INFO
    : newParkingLot
    ? PanelType.EDIT_PARKING_LOT
    : calloutShown
    ? PanelType.SINGLE_LOT_INFO
    : PanelType.ALL_LOTS_INFO;

  const handleCenter = () => {
    if (latLng && map) {
      const { latitude, longitude } = latLng;
      map.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: LAT_DELTA,
        longitudeDelta: LNG_DELTA,
      });
    }
  };

  const handleEdit = () => {
    if (isAdminEditing) {
      setNewParkingLot(null);
    }
    setIsAdminEditing(!isAdminEditing);
  };

  const handleTest = () => {
    setIsTestMode(!isTestMode);
  };

  const checkPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      showToast({
        title: 'Permission to access location was denied',
        type: 'error',
      });
      return;
    }

    let {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({});
    setLatLng({ latitude, longitude });
  };

  useEffect(() => {
    const init = async () => {
      if (user) {
        checkPermission();
      } else {
        navigation.navigate('LogIn');
      }
    };
    init();
  }, [isFocused]);

  const handleNewParkingLot = (e: MapPressEvent) => {
    setNewParkingLot({
      longitude: e.nativeEvent.coordinate.longitude,
      latitude: e.nativeEvent.coordinate.latitude,
    });
  };

  const handleCreateParkingLot = async (parkingLot: Omit<ParkingLot, 'id'>) => {
    try {
      await parkingApi.createParkingLot(parkingLot);
      setNewParkingLot(null);
      showToast({ title: 'Success!', type: 'success', duration: 2000 });
    } catch (e) {
      showToast({ title: (e as Error).message, type: 'error' });
    }
  };

  const renderedMap = useMemo(() => {
    if (latLng) {
      const offices = new Map<string, ParkingLot[]>();
      for (const lot of parkingLots) {
        const officeLots = offices.get(lot.officeName);
        if (officeLots) {
          offices.set(lot.officeName, [
            ...officeLots,
            JSON.parse(JSON.stringify(lot)),
          ]);
        } else {
          offices.set(lot.officeName, [JSON.parse(JSON.stringify(lot))]);
        }
      }

      const onUserLocationChange = ({ nativeEvent }) => {
        setUserLocation(nativeEvent.coordinate);
      };

      return (
        <MapView
          onUserLocationChange={onUserLocationChange}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={mapStyle}
          showsUserLocation={true}
          followsUserLocation={true}
          ref={map => {
            if (map) setMap(map);
          }}
          region={{
            latitude: latLng.latitude,
            longitude: latLng.longitude,
            latitudeDelta: LAT_DELTA,
            longitudeDelta: LNG_DELTA,
          }}
          onPress={(e: MapPressEvent) => {
            if (
              e.nativeEvent.action !== 'marker-press' &&
              e.nativeEvent.action !== 'polygon-press'
            ) {
              setCalloutShown(null);
              setOfficeSelected(null);
            }
            if (isAdminEditing) {
              handleNewParkingLot(e);
            }
          }}
          onMapReady={() => setMapReady(true)}
        >
          {parkingLots.map(lot => {
            const isUserParkingHere = lot.currUsers
              .map(user => user.id)
              .includes(user?.id || 0);
            return (
              <Marker
                coordinate={{
                  latitude: lot.latitude,
                  longitude: lot.longitude,
                }}
                key={`${lot.id}-${Date.now()}`}
                pinColor={
                  lot.totalLots - lot.currUsers.length === 0 ? 'red' : 'green'
                }
                ref={el => {
                  if (calloutShown === lot.id) {
                    markerRefs.current.get(lot.id)?.hideCallout();
                  }
                  el && markerRefs.current.set(lot.id, el);
                  el && el.showCallout();
                }}
                onPress={() => {
                  setCalloutShown(lot.id);
                  setOfficeSelected(null);
                }}
              >
                {isUserParkingHere && (
                  <Image
                    source={require('../../assets/car_side_view.png')}
                    style={styles.parkingImg}
                  />
                )}
                <Callout tooltip>
                  <CustomMarker
                    free={lot.totalLots - lot.currUsers.length}
                    total={lot.totalLots}
                  />
                </Callout>
              </Marker>
            );
          })}
          {newParkingLot && (
            <Marker
              coordinate={{
                latitude: newParkingLot.latitude,
                longitude: newParkingLot.longitude,
              }}
              key={`new-parking-lot-${Date.now()}`}
              pinColor={'grey'}
            ></Marker>
          )}
          {!isAdminEditing &&
            [...offices].map(keyValue => {
              return (
                <Polygon
                  coordinates={keyValue[1].map(lot => ({
                    latitude: lot.latitude,
                    longitude: lot.longitude,
                  }))}
                  fillColor="rgba(39, 213, 245, 0.20)"
                  strokeColor="#FFFFFF"
                  onPress={() => {
                    if (!isAdminEditing) {
                      setOfficeSelected(keyValue);
                      setCalloutShown(null);
                    }
                  }}
                  tappable
                  key={`polygon-${keyValue[1][0].officeName}-${Date.now()}`}
                />
              );
            })}
        </MapView>
      );
    }
  }, [parkingLots, latLng, newParkingLot, isAdminEditing]);

  return (
    <View style={styles.container}>
      {latLng !== null && user && (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {renderedMap}

          <FloatingMenuBtn
            style={styles.navigateBtn}
            onPress={() => {
              if (calloutShown) {
                const parkingLot = parkingLots.find(
                  ({ id }) => id === calloutShown,
                );
                if (!parkingLot) return;
                const { latitude, longitude } = parkingLot;
                openMaps({ latitude, longitude });
              } else {
                handleCenter();
              }
            }}
          >
            <Image
              source={require('../../assets/navigation.png')}
              style={styles.floatingBtnImg}
            />
          </FloatingMenuBtn>
          {user.isAdmin ? (
            <FloatingMenuBtn style={styles.adminEditBtn} onPress={handleEdit}>
              {isAdminEditing ? (
                <Image
                  source={require('../../assets/close.png')}
                  style={styles.floatingBtnImg}
                />
              ) : (
                <Image
                  source={require('../../assets/pencil.png')}
                  style={styles.floatingBtnImg}
                />
              )}
            </FloatingMenuBtn>
          ) : null}
          <FloatingMenuBtn style={styles.testBtn} onPress={handleTest}>
            {isTestMode ? (
              <Image
                source={require('../../assets/close.png')}
                style={styles.floatingBtnImg}
              />
            ) : (
              <Image
                source={require('../../assets/incognito.png')}
                style={styles.floatingBtnImg}
              />
            )}
          </FloatingMenuBtn>
          <Panel
            type={panelDisplayed}
            handleCreateParkingLot={handleCreateParkingLot}
            newParkingLot={newParkingLot}
            isTestMode={isTestMode}
            office={officeSelected}
          />
        </View>
      )}
      {(!mapReady || !dataReady) && <Spinner />}
    </View>
  );
};

export default HomeScreen;
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: colors.white,
    position: 'relative',
  },
  header: {
    backgroundColor: colors.blue,
    height: parameters.headerHeight,
    alignItems: 'flex-start',
  },
  navigateBtn: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.37,
    right: SCREEN_WIDTH * 0.05,
  },
  testBtn: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.45,
    right: SCREEN_WIDTH * 0.05,
  },
  adminEditBtn: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.53,
    right: SCREEN_WIDTH * 0.05,
  },

  floatingBtnImg: {
    width: SCREEN_HEIGHT * 0.03,
    height: SCREEN_HEIGHT * 0.03,
  },
  card: {
    alignItems: 'center',
    margin: SCREEN_WIDTH / 22,
  },

  title: {
    color: colors.black,
    fontSize: 16,
  },

  map: {
    marginVertical: 0,
    width: SCREEN_WIDTH,
    height: '100%',
  },

  parkingImg: {
    width: 68,
    height: 32,
  },

  location: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
