import { Divider, useTheme } from "react-native-paper";

export default function HorizontalLine() {
  const { colors } = useTheme();
  return (
    <Divider
      className="flex-1"
      style={{ backgroundColor: colors.onBackground }}
    />
  );
}
