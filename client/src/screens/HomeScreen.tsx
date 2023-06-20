import { StatusBar } from "expo-status-bar"
import { StyleSheet, Text, View, Dimensions, Image } from "react-native"
import { colors, parameters } from "../global/styles"
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
import { getDistance } from "geolib"
import CustomMarker from "../components/Marker"
import Panel, { PanelType } from "../components/Panel/Panel"
import RecenterBtn from "../components/RecenterBtn"
import { AppContext } from "../context"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation"
import { useIsFocused } from "@react-navigation/core"
import AdminEditBtn from "../components/AdminEditBtn"
import { ParkingLot, parkingApi } from "../api/parking_lot"
import { wait } from "../utils/time"
import { ParkingAction, parkingActionApi } from "../api/parking_action"
const SCREEN_WIDTH = Dimensions.get("window").width
const LAT_DELTA = 0.005
const LNG_DELTA = 0.0025

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>

const HomeScreen = () => {
  const [map, setMap] = useState(null)
  // coordinate of the current user
  const [latLng, setLatLng] = useState(null)
  const [errMsg, setErrorMsg] = useState(null)
  let markerRefs = useRef<MapMarker[]>([])
  const [calloutShown, setCalloutShown] = useState<number>(null)
  const [parkedAt, setParkedAt] = useState(null)
  const appContext = useContext(AppContext)
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const isFocused = useIsFocused()
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([])
  const [newParkingLot, setNewParkingLot] = useState<{
    longitude: number
    latitude: number
  }>(null)
  const [isAdminEditing, setIsAdminEditing] = useState(false)
  const [rerenderMarkersFlag, triggerRerenderMarkers] = useState(false)
  const [parkingActions, setParkingActions] = useState<ParkingAction[]>([])

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
    setIsAdminEditing(!isAdminEditing)
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
        lot.currUsers.findIndex((user) => user.id === appContext.user.id) >= 0
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
        console.log(parkingActions)
        setParkingLots(lots)
        setParkingActions(parkingActions)
      } else {
        navigation.navigate("LogIn")
      }
    }
    init()
  }, [isFocused])

  const onUserLocationChange = ({ nativeEvent }) => {
    for (let i = 0; i < parkingLots.length; i++) {
      const distance = getDistance(nativeEvent.coordinate, {
        latitude: parkingLots[i].latitude,
        longitude: parkingLots[i].longitude,
      })
      // if (distance < 30 && calloutShown !== i) {
      //   markerRefs[i].current.showCallout()
      //   setCalloutShown(i)
      // }
    }
  }

  const handleNewParkingLot = (e: MapPressEvent) => {
    setNewParkingLot({
      longitude: e.nativeEvent.coordinate.longitude,
      latitude: e.nativeEvent.coordinate.latitude,
    })
  }

  const resetParkingLots = async () => {
    const lots = (await parkingApi.listParkingLots()).data
    setParkingLots(lots)
    triggerRerenderMarkers(!rerenderMarkersFlag)
    await wait(10)
    if (calloutShown !== null) {
      markerRefs.current[calloutShown].showCallout()
    }
  }
  const handleCreateParkingLot = async (parkingLot: Omit<ParkingLot, "id">) => {
    await parkingApi.createParkingLot(parkingLot)
    await resetParkingLots()
    setNewParkingLot(null)
  }

  return (
    <View style={styles.container}>
      {latLng !== null && (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <MapView
            onUserLocationChange={onUserLocationChange}
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
                pinColor={
                  parkedAt === lot.id
                    ? undefined
                    : lot.freeLots === 0
                    ? "red"
                    : "green"
                }
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
                pinColor={"red"}
              >
                {/* <Image
                    source={require("../../assets/leave-action.png")}
                    style={styles.parkingImg}
                  /> */}
              </Marker>
            )}
          </MapView>
          <RecenterBtn style={styles.recenterBtn} onPress={handleCenter} />
          <AdminEditBtn
            style={styles.adminEditBtn}
            onPress={handleEdit}
            isAdminEditing={isAdminEditing}
          />
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
    paddingTop: parameters.statusBarHeight,
  },
  header: {
    backgroundColor: colors.blue,
    height: parameters.headerHeight,
    alignItems: "flex-start",
  },
  recenterBtn: {
    position: "absolute",
    bottom: 320,
    right: 20,
  },
  adminEditBtn: {
    position: "absolute",
    bottom: 390,
    right: 20,
  },
  image1: {
    height: 100,
    width: 100,
  },

  image2: { height: 60, width: 60, borderRadius: 30 },

  home: {
    backgroundColor: colors.blue,
    paddingLeft: 20,
  },

  text1: {
    color: colors.white,
    fontSize: 21,
    paddingBottom: 20,
    paddingTop: 20,
  },

  text2: {
    color: colors.white,
    fontSize: 16,
  },

  view1: {
    flexDirection: "row",
    flex: 1,
    paddingTop: 30,
  },

  button1: {
    height: 40,
    width: 150,
    backgroundColor: colors.black,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  button1Text: {
    color: colors.white,
    fontSize: 17,
    marginTop: -2,
  },
  card: {
    alignItems: "center",
    margin: SCREEN_WIDTH / 22,
  },

  view2: { marginBottom: 5, borderRadius: 15, backgroundColor: colors.grey6 },

  title: {
    color: colors.black,
    fontSize: 16,
  },
  view3: {
    flexDirection: "row",
    marginTop: 5,
    height: 50,
    backgroundColor: colors.grey6,
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 15,
  },
  text3: { marginLeft: 15, fontSize: 20, color: colors.black },

  view4: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
  },

  view5: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 25,
    justifyContent: "space-between",
    marginHorizontal: 15,
    borderBottomColor: colors.grey4,
    borderBottomWidth: 1,
    flex: 1,
  },

  view6: {
    alignItems: "center",
    flex: 5,
    flexDirection: "row",
  },
  view7: {
    backgroundColor: colors.grey6,
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },

  map: {
    marginVertical: 0,
    width: SCREEN_WIDTH,
    height: "100%",
  },

  text4: {
    fontSize: 20,
    color: colors.black,
    marginLeft: 20,
    marginBottom: 20,
  },

  icon1: { marginLeft: 10, marginTop: 5 },

  view8: { flex: 4, marginTop: -25 },
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

  view9: { width: 4, height: 4, borderRadius: 2, backgroundColor: "white" },
})
