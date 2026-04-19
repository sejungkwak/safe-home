import { View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

export default function TripInfoItem({
  icon,
  infoText,
}: {
  icon: string;
  infoText: string;
}) {
  const { colors } = useTheme();
  return (
    <View className="flex-row items-center gap-2 ms-2 mb-4">
      <Icon source={icon} size={20} />
      <Text style={{ color: colors.onSurface }}>{infoText}</Text>
    </View>
  );
}
