import Map from "@/components/ui/map";
import ScreenContainer from "@/components/ui/screen-container";
import { View } from "react-native";

function HomeScreen() {
  return (
    <ScreenContainer>
      <View>
        <Map />
      </View>
    </ScreenContainer>
  );
}

export default HomeScreen;
