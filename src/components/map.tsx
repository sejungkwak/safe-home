import { cssInterop } from "nativewind";
import { useEffect, useRef } from "react";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";
import MapMarker from "./map-marker";

cssInterop(MapView, { className: { target: "style" } });

export default function Map({
  pickUpCoords,
  dropOffCoords,
}: {
  pickUpCoords: { latitude: number; longitude: number } | null;
  dropOffCoords: { latitude: number; longitude: number } | null;
}) {
  const mapRef = useRef<MapView>(null);

  // zoom-in to show both locations in the screen.
  useEffect(() => {
    if (pickUpCoords && dropOffCoords && mapRef.current) {
      mapRef.current.fitToCoordinates([pickUpCoords, dropOffCoords], {
        edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
        animated: true,
      });
    }
  }, [pickUpCoords, dropOffCoords]);

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
    </MapView>
  );
}
