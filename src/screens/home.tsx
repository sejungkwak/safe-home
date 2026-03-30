import { Alert } from "react-native";

import Map from "@/components/map";
import ScreenContainer from "@/components/ui/screen-container";
import useUserLocation from "@/lib/user-location";

function HomeScreen() {
  const { errorMsg, location } = useUserLocation();

  if (errorMsg) Alert.alert(errorMsg);

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
    </ScreenContainer>
  );
}

export default HomeScreen;
