import { cssInterop } from "nativewind";
import { useRef } from "react";
import { Dimensions } from "react-native";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";

import MapDirection from "./map-direction";
import MapMarker from "./map-marker";

cssInterop(MapView, { className: { target: "style" } });

export default function Map({
  pickUpCoords,
  dropOffCoords,
}: {
  pickUpCoords: { latitude: number; longitude: number } | null;
  dropOffCoords: { latitude: number; longitude: number } | null;
}) {
  const { width, height } = Dimensions.get("window");
  const mapRef = useRef<MapView>(null);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      initialRegion={
        pickUpCoords
          ? {
              latitude: pickUpCoords.latitude,
              longitude: pickUpCoords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }
          : undefined
      }
      showsUserLocation={true}
      showsPointsOfInterest={false}
      className="flex-1 absolute top-0 left-0 right-0 bottom-0 z-0"
    >
      {pickUpCoords && <MapMarker coordinate={pickUpCoords} />}
      {dropOffCoords && <MapMarker coordinate={dropOffCoords} />}
      {pickUpCoords && dropOffCoords && (
        <MapDirection
          origin={pickUpCoords}
          destination={dropOffCoords}
          onReady={(result) => {
            mapRef.current?.fitToCoordinates(result.coordinates, {
              edgePadding: {
                top: height / 20,
                right: width / 20,
                bottom: height / 20,
                left: width / 20,
              },
            });
          }}
        />
      )}
    </MapView>
  );
}
