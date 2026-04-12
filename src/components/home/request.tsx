import { Link } from "expo-router";
import { cssInterop } from "nativewind";
import { Text, View } from "react-native";
import { Icon, useTheme } from "react-native-paper";

import { useTrip } from "@/context/trip";

import { useEffect } from "react";
import ChipButton from "../ui/chip-button";
import PrimaryButton from "../ui/primary-button";

cssInterop(PrimaryButton, { className: { target: "style" } });

export default function Request({ distance }: { distance: number }) {
  const { colors } = useTheme();
  const { setFare } = useTrip();

  // fare calculation: initial charge of €5.00 + €0.50 per km
  // it is simple and could be extended to factor in time, region, etc.
  const fare = (5 + distance * 0.5).toFixed(2);

  // store the value of fare in the React context
  useEffect(() => {
    setFare(Number(fare));
  }, [fare]);

  function onSubmit() {
    console.log("request button pressed");
  }

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
      {/* TODO onPress: display payment options */}
      <ChipButton icon="wallet-outline" onPress={() => {}}>
        €{fare} (Cash)
      </ChipButton>
      {/* TODO onPress: send notification to drivers */}
      <PrimaryButton className="m-2" onPress={onSubmit}>
        Request
      </PrimaryButton>
    </View>
  );
}
