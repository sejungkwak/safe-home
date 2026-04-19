import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

function ScreenContainer({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["left", "right", "bottom"]}
    >
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}

export default ScreenContainer;
