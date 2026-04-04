import * as Location from "expo-location";
import { useEffect, useState } from "react";

// The following function adopted from https://docs.expo.dev/versions/latest/sdk/location/#usage

export default function useUserLocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }
    let loc = await Location.getCurrentPositionAsync({
      accuracy: Location.LocationAccuracy.BestForNavigation,
    });

    // retrieving an address from latitude and longitute taken from
    // https://github.com/adrianhajdin/uber/blob/main/app/(root)/(tabs)/home.tsx
    const address = await Location.reverseGeocodeAsync({
      latitude: loc.coords?.latitude!,
      longitude: loc.coords?.longitude!,
    });

    setLocation({
      latitude: loc.coords?.latitude!,
      longitude: loc.coords?.longitude!,
      address: `${address[0].name} ${address[0].region}`,
    });
  }

  return { errorMsg, location };
}
