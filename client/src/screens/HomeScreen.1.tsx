import { View, Image } from "react-native"
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Callout,
  MapPressEvent,
  MapMarker,
} from "react-native-maps"
import { mapStyle } from "../global/mapStyle"
import * as Location from "expo-location"
import { useEffect, useRef, useState, useContext, useMemo } from "react"
import CustomMarker from "../components/Marker"
import Panel, { PanelType } from "../components/Panel/Panel"
import { AppContext } from "../context"
import { useIsFocused } from "@react-navigation/core"
import { ParkingLot, parkingApi } from "../api/parking_lot"
import FloatingMenuBtn from "../components/FloatingMenuButton"
import { showToast } from "../utils/toast"
import Spinner from "../components/Spinner"
import { LAT_DELTA, LNG_DELTA, styles } from "./HomeScreen"

export const HomeScreen = ({ navigation }) => {
  const [map, setMap] = useState<MapView | null>(null)
  // coordinate of the current user
  const [latLng, setLatLng] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  let markerRefs = useRef<Map<string, MapMarker>>(new Map())
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

  const resetMarker = async () => {
    // const ref1 = markerRefs.current.get(calloutShown)
    // console.log("after trigger rerender markers")
    // await wait(10)
    console.log("after trigger rerender markers 2")
    if (calloutShown !== null && markerRefs.current.get(calloutShown)) {
      console.log(
        "after trigger rerender markers 3"
        // markerRefs.current.get(calloutShown) === ref1
      )
      markerRefs.current.get(calloutShown)?.showCallout()
    }
  }

  useEffect(() => {
    console.log("callout changed", calloutShown)
  }, [calloutShown])

  useEffect(() => {
    console.log("parkinglots changed")
    setParkedAt(null)
    parkingLots.forEach((lot) => {
      if (lot.currUsers.findIndex((u) => u.id === user?.id) >= 0)
        setParkedAt(lot.id)
    })
    // if (calloutShown) {
    //   resetMarker()
    // }
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

  const markers = useMemo(() => {
    console.log("in usememo", parkingLots.length)
    return parkingLots.map((lot, idx) => {
      // console.log(idx, `${lot.id}${JSON.stringify(lot.currUsers)}`)
      return (
        <Marker
          coordinate={{
            latitude: lot.latitude,
            longitude: lot.longitude,
          }}
          key={`${lot.id}-${Date.now()}`}
          pinColor={getPincolor(lot)}
          ref={(el) => el && markerRefs.current.set(lot.id, el)}
          onPress={() => {
            setCalloutShown(lot.id)
          }}
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
      )
    })
  }, [parkingLots, parkedAt])

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
            {markers}
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
