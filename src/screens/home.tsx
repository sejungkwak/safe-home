import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "react-native-paper";

import Request from "@/components/home/request";
import Map from "@/components/map/map";
import MapSearch from "@/components/map/map-search";
import ScreenContainer from "@/components/ui/screen-container";
import useUserLocation from "@/lib/user-location";

cssInterop(GestureHandlerRootView, { className: { target: "style" } });
cssInterop(BottomSheetView, { className: { target: "style" } });

interface Coords {
  latitude: number;
  longitude: number;
  address: string;
}

export default function HomeScreen() {
  const { colors } = useTheme();

  const { errorMsg, location } = useUserLocation();
  if (errorMsg) Alert.alert(errorMsg);

  const [origin, setOrigin] = useState<Coords | null>(null);
  const [destination, setDestination] = useState<Coords | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (location && !origin) {
      setOrigin({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });
    }
  }, [location]);

  return (
    <ScreenContainer>
      <Map
        pickUpCoords={origin}
        dropOffCoords={destination ?? null}
        onReady={(result) => {
          setRouteInfo({
            distance: result.distance,
            duration: result.duration,
          });
        }}
      />
      <GestureHandlerRootView className="flex-1">
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={["50%", "90%"]}
          keyboardBehavior="fillParent"
          backgroundStyle={{ backgroundColor: colors.background }}
          enableDynamicSizing={true}
          maxDynamicContentSize={300}
        >
          {/* Extra bottom padding to prevent the navigation bar from overlapping the bottom sheet */}
          <BottomSheetView className="flex-1 pt-4 pb-80">
            {/* origin location */}
            <MapSearch
              placeholder="Where from?"
              icon="circle-slice-8"
              searchFor="origin"
              onSelect={setOrigin}
              onClear={() => setOrigin(null)}
              defaultValue={origin?.address}
            />
            {/* destination location */}
            <MapSearch
              placeholder="Where to?"
              icon="map-marker-outline"
              searchFor="destination"
              onSelect={setDestination}
              onClear={() => setDestination(null)}
            />
            {/* TODO Saved addresses for user to select by pressing */}
            {origin && destination && routeInfo && (
              <Request distance={routeInfo.distance ?? 0} />
            )}
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </ScreenContainer>
  );
}
