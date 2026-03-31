import { Link } from "expo-router";
import { cssInterop } from "nativewind";
import { Text, View } from "react-native";
import { Icon, useTheme } from "react-native-paper";

import ChipButton from "../ui/chip-button";
import PrimaryButton from "../ui/primary-button";

cssInterop(PrimaryButton, { className: { target: "style" } });

export default function Request() {
  const { colors } = useTheme();

  return (
    <View>
      <View className="flex-row items-center mx-2">
        <Icon size={40} source="car" color={colors.onBackground} />
        <Link href="/(tabs)/account">
          <View className="flex-col gap-1 my-4">
            {/* TODO Reg should be retrieved from database. */}
            <Text
              className="mt-2 ms-2 text-xl"
              style={{ color: colors.onBackground }}
            >
              261D1111
            </Text>
            <Text className="mb-2 ms-2" style={{ color: colors.primary }}>
              Edit my vehicle
            </Text>
          </View>
        </Link>
      </View>
      {/* TODO onPress: display payment options, fare logic */}
      <ChipButton icon="wallet-outline" onPress={() => {}}>
        €25.00 (Cash)
      </ChipButton>
      {/* TODO onPress: send notification to drivers */}
      <PrimaryButton className="m-2" onPress={() => {}}>
        Request
      </PrimaryButton>
    </View>
  );
}
