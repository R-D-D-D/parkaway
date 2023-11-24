import { Linking, Platform } from "react-native";

export interface GoogleMapsProps {
  latitude: number;
  longitude: number;
}

export const openGoogleMaps = ({ latitude, longitude }: GoogleMapsProps) => {
  const scheme = Platform.select({
    ios: "maps://0,0?q=",
    android: "google.navigation:q=",
  });
  const latLng = `${latitude},${longitude}`;
  const url = Platform.select({
    ios: `${scheme}@${latLng}`,
    android: `${scheme}${latLng}`,
  });

  if (!url) return;

  Linking.openURL(url);
};
