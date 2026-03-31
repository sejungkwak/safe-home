import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import { useRef } from "react";
import { Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text, useTheme } from "react-native-paper";

import Map from "@/components/map";
import MapSearch from "@/components/map-search";
import ScreenContainer from "@/components/ui/screen-container";
import useUserLocation from "@/lib/user-location";

cssInterop(GestureHandlerRootView, { className: { target: "style" } });
cssInterop(BottomSheetView, { className: { target: "style" } });

function HomeScreen() {
  const { errorMsg, location } = useUserLocation();
  const { colors } = useTheme();

  if (errorMsg) Alert.alert(errorMsg);

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <ScreenContainer>
      <Map
        coordinate={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }
            : null
        }
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
          <BottomSheetView className="flex-1 py-4">
            <MapSearch placeholder="Where to?" icon="magnify" />
            <Text className="p-2">Home</Text>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </ScreenContainer>
  );
}

export default HomeScreen;
