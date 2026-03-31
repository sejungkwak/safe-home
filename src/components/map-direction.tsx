import MapViewDirections from "react-native-maps-directions";
import { useTheme } from "react-native-paper";

const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY!;

export default function MapDirection({
  origin,
  destination,
  onReady,
}: {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  onReady?: (result: {
    distance: number;
    duration: number;
    coordinates: { latitude: number; longitude: number }[];
  }) => void;
}) {
  const { colors } = useTheme();

  return (
    <MapViewDirections
      origin={origin}
      destination={destination}
      apikey={GOOGLE_MAPS_KEY}
      strokeWidth={3}
      strokeColor={colors.onBackground}
      optimizeWaypoints={true}
      onReady={(result) => {
        onReady?.(result);
      }}
    />
  );
}
