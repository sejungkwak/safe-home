import { Marker } from "react-native-maps";

export default function MapMarker({
  coordinate,
  imageUri,
}: {
  coordinate: { latitude: number; longitude: number } | null;
  imageUri: number | undefined;
}) {
  if (!coordinate) return null;

  return <Marker coordinate={coordinate} image={imageUri} />;
}
