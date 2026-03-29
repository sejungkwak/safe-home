import { Colors } from "@/constants/theme";
import { ReactNode } from "react";
import { Text, useColorScheme } from "react-native";

function ScreenTitle({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();

  const color =
    colorScheme === "dark"
      ? Colors.dark.onBackground
      : Colors.light.onBackground;

  return (
    <Text className="text-[24px] font-semibold mb-6" style={{ color: color }}>
      {children}
    </Text>
  );
}

export default ScreenTitle;
