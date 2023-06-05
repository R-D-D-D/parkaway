import { StatusBar } from "expo-status-bar"
import { StyleSheet, Text, View, Dimensions, Image } from "react-native"
import { colors, parameters } from "../global/styles"
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Callout,
  CalloutSubview,
} from "react-native-maps"
import { mapStyle } from "../global/mapStyle"
import * as Location from "expo-location"
import { useEffect, useRef, useState } from "react"
import { Tooltip, Button } from "react-native-elements"
import { getDistance } from "geolib"
import CustomMarker from "../components/Marker"
import Panel from "../components/Panel"

const SCREEN_WIDTH = Dimensions.get("window").width
const LAT_DELTA = 0.005
const LNG_DELTA = 0.0025

const HomeScreen = () => {
  const mapRef = useRef(1)
  const [latLng, setLatLng] = useState(null)
  const [errMsg, setErrorMsg] = useState(null)
  const [parkingLotConfigs, setParkingLotConfigs] = useState([])
  const parkingIconRefs = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((x) =>
    useRef(null)
  )
  const [calloutShown, setCalloutShown] = useState(null)
  const [parkedAt, setParkedAt] = useState(null)

  const randomPlusMinus = () => {
    if (Math.random() < 0.5) {
      return -1
    } else {
      return 1
    }
  }

  const generateParkingLatLngs = (latitude, longitude) => {
    const parkingLots = []
    for (let i = 0; i < 11; i++) {
      const total = Math.floor(Math.random() * 3) + 1
      parkingLots.push({
        latitude: latitude + Math.random() * LAT_DELTA * randomPlusMinus(),
        longitude: longitude + Math.random() * LNG_DELTA * randomPlusMinus(),
        free: Math.floor(total * Math.random()),
        total,
      })
    }
    parkingLots.push({
      latitude: latitude,
      longitude: longitude,
      free: 1,
      total: 3,
    })
    setParkingLotConfigs(parkingLots)
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
    generateParkingLatLngs(latitude, longitude)
  }

  useEffect(() => {
    checkPermission()
  }, [])

  const onUserLocationChange = ({ nativeEvent }) => {
    // console.log(nativeEvent.coordinate)
    // console.log(getDistance(latLng, nativeEvent.coordinate))
    for (let i = 0; i < 12; i++) {
      const distance = getDistance(nativeEvent.coordinate, {
        latitude: parkingLotConfigs[i].latitude,
        longitude: parkingLotConfigs[i].longitude,
      })
      if (distance < 30 && calloutShown !== i) {
        parkingIconRefs[i].current.showCallout()
        setCalloutShown(i)
      }
    }
  }

  const park = (idx) => {
    const temp = [...parkingLotConfigs]
    temp[idx].free = parkingLotConfigs[idx].free - 1
    setParkingLotConfigs(temp)
    setParkedAt(idx)
    parkingIconRefs[idx].current.hideCallout()
  }

  const leave = (idx) => {
    const temp = [...parkingLotConfigs]
    temp[idx].free = parkingLotConfigs[idx].free + 1
    setParkingLotConfigs(temp)
    setParkedAt(null)
    parkingIconRefs[idx].current.hideCallout()
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
            ref={mapRef}
            region={{
              latitude: latLng.latitude,
              longitude: latLng.longitude,
              latitudeDelta: LAT_DELTA,
              longitudeDelta: LNG_DELTA,
            }}
          >
            {parkingLotConfigs.map((config, idx) => (
              <Marker
                coordinate={{
                  latitude: config.latitude,
                  longitude: config.longitude,
                }}
                key={idx}
                // pinColor={config.occupied ? colors.red : colors.green}
                ref={parkingIconRefs[idx]}
              >
                <CustomMarker free={config.free} total={config.total} />
                {((config.free > 0 && parkedAt === null) ||
                  parkedAt === idx) && (
                  <Callout tooltip>
                    <CalloutSubview
                      onPress={() => {
                        parkedAt !== null && parkedAt === idx
                          ? leave(idx)
                          : config.free > 0
                          ? park(idx)
                          : "Full"
                      }}
                    >
                      <Button
                        style={{
                          width: 80,
                        }}
                        title={
                          parkedAt !== null && parkedAt === idx
                            ? "Leave"
                            : config.free > 0
                            ? "Park"
                            : "Full"
                        }
                      />
                    </CalloutSubview>
                  </Callout>
                )}
                {/* <Tooltip
                  popover={<Text>Info here</Text>}
                  ref={(el) => (parkingIconRefs.current[idx] = el)}
                >
                  <Image
                    source={require("../../assets/parking-sign.png")}
                    style={styles.parkingImg}
                  />
                </Tooltip> */}
              </Marker>
            ))}
          </MapView>
          <Panel />
        </View>
      )}
    </View>
  )
}

export default HomeScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: parameters.statusBarHeight,
  },
  header: {
    backgroundColor: colors.blue,
    height: parameters.headerHeight,
    alignItems: "flex-start",
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
    width: 14,
    height: 14,
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
