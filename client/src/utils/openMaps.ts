import { Linking, Platform } from 'react-native';
import { showToast } from './toast';

export interface GoogleMapsProps {
  latitude: number;
  longitude: number;
}

export const openMaps = async ({ latitude, longitude }: GoogleMapsProps) => {
  const getURL = Platform.select({
    ios: ({ latitude, longitude }: GoogleMapsProps) =>
      `http://maps.apple.com/?daddr=${latitude},${longitude}`,
    android: ({ latitude, longitude }: GoogleMapsProps) =>
      `google.navigation:q=${latitude},${longitude}`,
  });
  if (!getURL) return;

  const url = getURL({ latitude, longitude });

  try {
    await Linking.canOpenURL(url);
    Linking.openURL(url);
  } catch {
    showToast({
      title: 'Ensure that google maps is installed!',
      type: 'error',
    });
  }
};
