import { cssInterop } from "nativewind";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";
import MapMarker from "./map-marker";

cssInterop(MapView, { className: { target: "style" } });

function Map({
  coordinate,
}: {
  coordinate: { latitude: number; longitude: number } | null;
}) {
  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      region={
        coordinate
          ? {
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }
          : undefined
      }
      showsUserLocation={true}
      showsPointsOfInterest={false}
      className="flex-1 absolute top-0 left-0 right-0 bottom-0 z-0"
    >
      <MapMarker coordinate={coordinate} />
    </MapView>
  );
}

export default Map;
