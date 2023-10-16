import { StatusBar } from "expo-status-bar"
import { StyleSheet, Text, View, Dimensions, Image } from "react-native"
import {
  colors,
  parameters,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from "../global/styles"
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Callout,
  CalloutSubview,
  MapPressEvent,
  MapMarker,
} from "react-native-maps"
import { mapStyle } from "../global/mapStyle"
import * as Location from "expo-location"
import { useEffect, useRef, useState, useContext } from "react"
import { Tooltip, Button } from "react-native-elements"
import CustomMarker from "../components/Marker"
import Panel, { PanelType } from "../components/Panel/Panel"
import { AppContext } from "../context"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation"
import { useIsFocused } from "@react-navigation/core"
import { ParkingLot, parkingApi } from "../api/parking_lot"
import { wait } from "../utils/time"
import { ParkingAction, parkingActionApi } from "../api/parking_action"
import FloatingMenuBtn from "../components/FloatingMenuButton"
import { showToast } from "../utils/toast"
import Spinner from "../components/Spinner"

const LAT_DELTA = 0.005
const LNG_DELTA = 0.0025

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>

const HomeScreen = ({ navigation }) => {
  const [map, setMap] = useState<MapView | null>(null)
  // coordinate of the current user
  const [latLng, setLatLng] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  let markerRefs = useRef<MapMarker[]>([])
  const [parkedAt, setParkedAt] = useState<string | null>(null)
  const { user, parkingLots, parkingActions, calloutShown, setCalloutShown } =
    useContext(AppContext)
  // const navigation = useNavigation<HomeScreenNavigationProp>()
  const isFocused = useIsFocused()
  const [newParkingLot, setNewParkingLot] = useState<{
    longitude: number
    latitude: number
  } | null>(null)
  const [isAdminEditing, setIsAdminEditing] = useState(false)
  const [rerenderMarkersFlag, triggerRerenderMarkers] = useState(false)
  const [isTestMode, setIsTestMode] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const dataReady = true

  const handleCenter = () => {
    if (latLng && map) {
      const { latitude, longitude } = latLng
      map.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: LAT_DELTA,
        longitudeDelta: LNG_DELTA,
      })
    }
  }

  const handleEdit = () => {
    if (isAdminEditing) {
      setNewParkingLot(null)
    }
    setIsAdminEditing(!isAdminEditing)
  }

  const handleTest = () => {
    setIsTestMode(!isTestMode)
  }

  const checkPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      showToast({
        title: "Permission to access location was denied",
        type: "error",
      })
      return
    }

    let {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({})
    setLatLng({ latitude, longitude })
  }

  useEffect(() => {
    let userParkedFlag = false
    parkingLots.forEach((lot) => {
      if (lot.currUsers.findIndex((u) => u.id === user?.id) >= 0) {
        setParkedAt(lot.id)
        userParkedFlag = true
      }
    })
    if (!userParkedFlag) setParkedAt(null)
    const resetMarker = async () => {
      setCalloutShown(null)
      triggerRerenderMarkers(!rerenderMarkersFlag)
      await wait(10)
      if (calloutShown !== null && markerRefs.current[calloutShown]) {
        markerRefs.current[calloutShown].showCallout()
      }
    }

    resetMarker()
  }, [parkingLots])

  useEffect(() => {
    const init = async () => {
      if (user) {
        checkPermission()
      } else {
        navigation.navigate("LogIn")
      }
    }
    init()
  }, [isFocused])

  // const onUserLocationChange = ({ nativeEvent }) => {
  //   for (let i = 0; i < parkingLots.length; i++) {
  //     const distance = getDistance(nativeEvent.coordinate, {
  //       latitude: parkingLots[i].latitude,
  //       longitude: parkingLots[i].longitude,
  //     })
  //     if (distance < 30 && calloutShown !== i) {
  //       markerRefs[i].current.showCallout()
  //       setCalloutShown(i)
  //     }
  //   }
  // }

  const handleNewParkingLot = (e: MapPressEvent) => {
    setNewParkingLot({
      longitude: e.nativeEvent.coordinate.longitude,
      latitude: e.nativeEvent.coordinate.latitude,
    })
  }

  // const resetParkingLots = async () => {
  //   setCalloutShown(null)
  //   const lots = (await parkingApi.listParkingLots()).data
  //   const parkingActions = (await parkingActionApi.listParkingAction(20)).data
  //   setParkingLots(lots)
  //   setParkingActions(parkingActions)
  //   triggerRerenderMarkers(!rerenderMarkersFlag)
  //   await wait(10)
  //   if (markerRefs.current[calloutShown] && calloutShown !== null) {
  //     markerRefs.current[calloutShown].showCallout()
  //   }
  // }

  const handleCreateParkingLot = async (parkingLot: Omit<ParkingLot, "id">) => {
    try {
      await parkingApi.createParkingLot(parkingLot)
      setNewParkingLot(null)
      showToast({ title: "Success!", type: "success", duration: 2000 })
    } catch (e) {
      showToast({ title: (e as Error).message, type: "error" })
    }
  }

  const getPincolor = (lot: ParkingLot) => {
    if (parkedAt === lot.id) {
      return undefined
    } else {
      return lot.totalLots - lot.currUsers.length === 0 ? "red" : "green"
    }
  }

  return (
    <View style={styles.container}>
      {latLng !== null && user && (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <MapView
            // onUserLocationChange={onUserLocationChange}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            customMapStyle={mapStyle}
            showsUserLocation={true}
            followsUserLocation={true}
            ref={(map) => setMap(map)}
            region={{
              latitude: latLng.latitude,
              longitude: latLng.longitude,
              latitudeDelta: LAT_DELTA,
              longitudeDelta: LNG_DELTA,
            }}
            onPress={(e: MapPressEvent) => {
              if (e.nativeEvent.action !== "marker-press") {
                setCalloutShown(null)
              }
              if (isAdminEditing) {
                handleNewParkingLot(e)
              }
            }}
            onMapReady={() => setMapReady(true)}
          >
            {parkingLots.map((lot, idx) => (
              <Marker
                coordinate={{
                  latitude: lot.latitude,
                  longitude: lot.longitude,
                }}
                key={`${lot.id}${rerenderMarkersFlag}`}
                pinColor={getPincolor(lot)}
                ref={(el) => (markerRefs.current[idx] = el)}
                onPress={() => setCalloutShown(idx)}
              >
                {parkedAt === lot.id && (
                  <Image
                    source={require("../../assets/car_side_view.png")}
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
            ))}
            {newParkingLot && (
              <Marker
                coordinate={{
                  latitude: newParkingLot.latitude,
                  longitude: newParkingLot.longitude,
                }}
                key={"new-parking-lot"}
                pinColor={"grey"}
              >
                {/* <Image
                        source={require("../../assets/leave-action.png")}
                        style={styles.parkingImg}
                      /> */}
              </Marker>
            )}
          </MapView>
          <FloatingMenuBtn style={styles.recenterBtn} onPress={handleCenter}>
            <Image
              source={require("../../assets/navigation.png")}
              style={styles.floatingBtnImg}
            />
          </FloatingMenuBtn>

          {user.isAdmin ? (
            <FloatingMenuBtn style={styles.adminEditBtn} onPress={handleEdit}>
              {isAdminEditing ? (
                <Image
                  source={require("../../assets/close.png")}
                  style={styles.floatingBtnImg}
                />
              ) : (
                <Image
                  source={require("../../assets/pencil.png")}
                  style={styles.floatingBtnImg}
                />
              )}
            </FloatingMenuBtn>
          ) : null}
          <FloatingMenuBtn style={styles.testBtn} onPress={handleTest}>
            {isTestMode ? (
              <Image
                source={require("../../assets/close.png")}
                style={styles.floatingBtnImg}
              />
            ) : (
              <Image
                source={require("../../assets/incognito.png")}
                style={styles.floatingBtnImg}
              />
            )}
          </FloatingMenuBtn>
          <Panel
            type={
              calloutShown === null
                ? PanelType.AllLotsInfo
                : PanelType.SingleLotInfo
            }
            isAdminEditing={isAdminEditing}
            handleCreateParkingLot={handleCreateParkingLot}
            newParkingLot={newParkingLot}
            calloutShown={calloutShown}
            parkingLots={parkingLots}
            parkingActions={parkingActions}
            isTestMode={isTestMode}
          />
        </View>
      )}
      {(!mapReady || !dataReady) && <Spinner />}
    </View>
  )
}

export default HomeScreen
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: colors.white,
    position: "relative",
  },
  header: {
    backgroundColor: colors.blue,
    height: parameters.headerHeight,
    alignItems: "flex-start",
  },
  recenterBtn: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.37,
    right: SCREEN_WIDTH * 0.05,
  },
  testBtn: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.45,
    right: SCREEN_WIDTH * 0.05,
  },
  adminEditBtn: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.53,
    right: SCREEN_WIDTH * 0.05,
  },

  floatingBtnImg: {
    width: SCREEN_HEIGHT * 0.03,
    height: SCREEN_HEIGHT * 0.03,
  },
  card: {
    alignItems: "center",
    margin: SCREEN_WIDTH / 22,
  },

  title: {
    color: colors.black,
    fontSize: 16,
  },

  map: {
    marginVertical: 0,
    width: SCREEN_WIDTH,
    height: "100%",
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
    alignItems: "center",
    justifyContent: "center",
  },
})
