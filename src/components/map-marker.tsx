import { Marker } from "react-native-maps";

export default function MapMarker({
  coordinate,
}: {
  coordinate: { latitude: number; longitude: number } | null;
}) {
  if (!coordinate) return null;

  return <Marker coordinate={coordinate} />;
}
