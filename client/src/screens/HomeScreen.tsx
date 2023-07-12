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
import {
  ActionInfo,
  ParkingAction,
  parkingActionApi,
} from "../api/parking_action"
import FloatingMenuBtn from "../components/FloatingMenuButton"
import { showLongToast, showShortToast } from "../utils/toast"

const LAT_DELTA = 0.005
const LNG_DELTA = 0.0025

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>

const HomeScreen = ({ navigation }) => {
  const [map, setMap] = useState(null)
  // coordinate of the current user
  const [latLng, setLatLng] = useState(null)
  const [errMsg, setErrorMsg] = useState(null)
  let markerRefs = useRef<MapMarker[]>([])
  const [calloutShown, setCalloutShown] = useState<number>(null)
  const [parkedAt, setParkedAt] = useState(null)
  const appContext = useContext(AppContext)
  // const navigation = useNavigation<HomeScreenNavigationProp>()
  const isFocused = useIsFocused()
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([])
  const [newParkingLot, setNewParkingLot] = useState<{
    longitude: number
    latitude: number
  }>(null)
  const [isAdminEditing, setIsAdminEditing] = useState(false)
  const [rerenderMarkersFlag, triggerRerenderMarkers] = useState(false)
  const [parkingActions, setParkingActions] = useState<ActionInfo[]>([])
  const [isTestMode, setIsTestMode] = useState(false)

  const handleCenter = () => {
    const { latitude, longitude } = latLng
    map.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: LAT_DELTA,
      longitudeDelta: LNG_DELTA,
    })
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

  const randomPlusMinus = () => {
    if (Math.random() < 0.5) {
      return -1
    } else {
      return 1
    }
  }

  const checkPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied")
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
      if (
        lot.currUsers.findIndex((user) => user.id === appContext.user?.id) >= 0
      ) {
        setParkedAt(lot.id)
        userParkedFlag = true
      }
    })
    if (!userParkedFlag) setParkedAt(null)
  }, [parkingLots])

  useEffect(() => {
    const init = async () => {
      // console.log("Initializing with context: ", appContext)
      if (appContext.user) {
        checkPermission()
        const lots = (await parkingApi.listParkingLots()).data
        const parkingActions = (await parkingActionApi.listParkingAction(20))
          .data
        setParkingLots(lots)
        setParkingActions(parkingActions)
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

  const resetParkingLots = async () => {
    const lots = (await parkingApi.listParkingLots()).data
    const parkingActions = (await parkingActionApi.listParkingAction(20)).data
    setParkingLots(lots)
    setParkingActions(parkingActions)
    triggerRerenderMarkers(!rerenderMarkersFlag)
    await wait(10)
    if (calloutShown !== null) {
      markerRefs.current[calloutShown].showCallout()
    }
  }
  const handleCreateParkingLot = async (parkingLot: Omit<ParkingLot, "id">) => {
    try {
      await parkingApi.createParkingLot(parkingLot)
      await resetParkingLots()
      setNewParkingLot(null)
      showShortToast("Success!")
    } catch (e) {
      showLongToast(e)
    }
  }

  const getPincolor = (lot: ParkingLot) => {
    if (parkedAt === lot.id) {
      return undefined
    } else {
      return lot.freeLots === 0 ? "red" : "green"
    }
  }

  return (
    <View style={styles.container}>
      {latLng !== null && appContext.user && (
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
                  <CustomMarker free={lot.freeLots} total={lot.totalLots} />
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

          {appContext.user?.isAdmin ? (
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
            resetParkingLots={resetParkingLots}
            parkingActions={parkingActions}
            isTestMode={isTestMode}
          />
        </View>
      )}
    </View>
  )
}

export default HomeScreen
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: colors.white,
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
