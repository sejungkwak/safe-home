import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Icon, useTheme } from "react-native-paper";

import fetchProfile from "@/api/profiles/fetch-profile";
import DriverApplicationList from "@/components/home/driver-application-list";
import Request from "@/components/home/request";
import RequestList from "@/components/home/request-list";
import Map from "@/components/map/map";
import MapSearch from "@/components/map/map-search";
import ChipButton from "@/components/ui/chip-button";
import ScreenContainer from "@/components/ui/screen-container";
import { useSession } from "@/context/auth";
import { useRole } from "@/context/role";
import { useTrip } from "@/context/trip";
import useUserLocation from "@/hooks/use-user-location";

// enable NativeWind className support for third-party and custom components
cssInterop(GestureHandlerRootView, { className: { target: "style" } });
cssInterop(BottomSheetView, { className: { target: "style" } });
cssInterop(ChipButton, { className: { target: "style" } });

/**
 * Displays a map with two input fields for the origin and destination.
 * The origin is set to the user's current location once the permission is granted.
 * Once both locations are set, the route and fare are displayed for users to request a driver.
 */
export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { role } = useRole();
  const { user } = useSession();

  // retrieve the user's current location and any permission or location error message
  const { errorMsg, location } = useUserLocation();

  const originRef = useRef(false);

  if (errorMsg) Alert.alert(errorMsg);

  const {
    origin,
    destination,
    routeInfo,
    resetKey,
    setOrigin,
    setDestination,
    setRouteInfo,
  } = useTrip();

  const [sheetHeight, setSheetHeight] = useState<number>(0);
  const [mapSearchKey, setMapSearchKey] = useState(0);
  const [savedAddress, setSavedAddress] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  useEffect(() => {
    if (resetKey > 0) setMapSearchKey((key) => key + 1);
  }, [resetKey]);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // sets the user's location as the default origin
  // the map renders before the location value is available,
  // so the location needs to be tracked.
  useEffect(() => {
    if (originRef.current) return;
    if (!location) return;

    setOrigin({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
    });
    originRef.current = true;
  }, [location, setOrigin]);

  useEffect(() => {
    async function getAddress() {
      if (!user) return;

      const userProfile = await fetchProfile(user.id);
      setSavedAddress(userProfile.address);
    }
    getAddress();
  }, [user]);

  return (
    <ScreenContainer>
      {role === "rider" && (
        <>
          <GestureHandlerRootView className="flex-1">
            <Map
              pickUpCoords={origin}
              dropOffCoords={destination ?? null}
              bottomPadding={sheetHeight}
              onReady={(result) => {
                setRouteInfo({
                  distance: result.distance,
                  duration: result.duration,
                });
              }}
            />
            <BottomSheet
              ref={bottomSheetRef}
              backgroundStyle={{ backgroundColor: colors.background }}
              enableDynamicSizing={true}
              keyboardBlurBehavior="restore"
            >
              <BottomSheetView
                className="flex-1"
                onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
              >
                {/* origin location */}
                <MapSearch
                  key={`origin-${mapSearchKey}`}
                  placeholder="Where from?"
                  icon="circle-slice-8"
                  searchFor="origin"
                  onSelect={setOrigin}
                  onClear={() => {
                    setOrigin(null);
                    setRouteInfo(null);
                  }}
                  defaultValue={origin?.address}
                />
                {/* destination location */}
                <View className="relative">
                  <MapSearch
                    key={`destination-${mapSearchKey}`}
                    placeholder="Where to?"
                    icon="map-marker-outline"
                    searchFor="destination"
                    onSelect={setDestination}
                    onClear={() => {
                      setDestination(null);
                      setRouteInfo(null);
                    }}
                    defaultValue={destination?.address}
                  />
                  <ChipButton
                    icon="calendar-clock-outline"
                    className="absolute top-2 right-4"
                    disabled={!routeInfo}
                    onPress={() => {
                      router.push("/booking");
                    }}
                  >
                    Later
                  </ChipButton>
                </View>
                {savedAddress && !destination && (
                  <Pressable
                    className="flex-row mx-2 mt-4 items-center"
                    onPress={() => setDestination(savedAddress)}
                  >
                    <Icon
                      size={36}
                      source="map-marker-plus-outline"
                      color={colors.primary}
                    />
                    <Text
                      className="ms-3 me-10 text-md"
                      style={{ color: colors.onSurface }}
                    >
                      {savedAddress.address}
                    </Text>
                  </Pressable>
                )}

                {origin && destination && routeInfo && (
                  <Request
                    distance={routeInfo.distance ?? 0}
                    onReset={() => setMapSearchKey((key) => key + 1)}
                  />
                )}
              </BottomSheetView>
            </BottomSheet>
          </GestureHandlerRootView>
        </>
      )}
      {role === "driver" && <RequestList />}
      {role === "admin" && <DriverApplicationList />}
    </ScreenContainer>
  );
}
