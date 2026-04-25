import { cssInterop } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";

import MapDirection from "./map-direction";
import MapMarker from "./map-marker";

cssInterop(MapView, { className: { target: "style" } });

/**
 * A custom map view utilising react-native-maps.
 * Displays a zoomed-in map focusing on the user's location by default.
 * Renders a route when a destination is entered.
 *
 * @param pickUpCoords The origin's latitude, longitude, and address
 * @param dropOffCoords The destination's latitude, longitude, and address
 * @param bottomPadding The height of the bottom sheet
 * @param onReady A callback function called when the route data is ready
 */
export default function Map({
  pickUpCoords,
  dropOffCoords,
  bottomPadding = 0,
  onReady,
}: {
  pickUpCoords: { latitude: number; longitude: number; address: string } | null;
  dropOffCoords: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  bottomPadding?: number;
  onReady?: (result: {
    distance: number;
    duration: number;
    coordinates: { latitude: number; longitude: number }[];
  }) => void;
}) {
  const { width, height } = Dimensions.get("window");
  const mapRef = useRef<MapView>(null);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[] | null
  >(null);

  // set the size of the map
  useEffect(() => {
    if (!routeCoords) return;
    mapRef.current?.fitToCoordinates(routeCoords, {
      edgePadding: {
        top: height / 20,
        right: width / 20,
        bottom: height / 20 + bottomPadding,
        left: width / 20,
      },
    });
  }, [routeCoords, bottomPadding, height, width]);

  // zoom in on either the origin or destination
  // when the other value is not set
  useEffect(() => {
    if (!dropOffCoords && pickUpCoords) {
      mapRef.current?.animateToRegion(
        {
          latitude: pickUpCoords.latitude,
          longitude: pickUpCoords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        2000,
      );
    }

    if (!pickUpCoords && dropOffCoords) {
      mapRef.current?.animateToRegion(
        {
          latitude: dropOffCoords.latitude,
          longitude: dropOffCoords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        2000,
      );
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
      showsPointsOfInterest={false}
      className="flex-1"
    >
      {pickUpCoords && (
        <MapMarker
          coordinate={pickUpCoords}
          imageUri={require("@/assets/images/origin.png")}
        />
      )}
      {dropOffCoords && (
        <MapMarker
          coordinate={dropOffCoords}
          imageUri={require("@/assets/images/destination.png")}
        />
      )}
      {pickUpCoords && dropOffCoords && (
        <MapDirection
          origin={pickUpCoords}
          destination={dropOffCoords}
          onReady={(result) => {
            onReady?.(result);
            setRouteCoords(result.coordinates);
          }}
        />
      )}
    </MapView>
  );
}
