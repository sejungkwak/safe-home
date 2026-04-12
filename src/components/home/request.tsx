import { Link } from "expo-router";
import { cssInterop } from "nativewind";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { Icon, useTheme } from "react-native-paper";

import { useSession } from "@/context/auth";
import { useTrip } from "@/context/trip";
import createTrip from "@/lib/create-trip";
import ChipButton from "../ui/chip-button";
import PrimaryButton from "../ui/primary-button";

cssInterop(PrimaryButton, { className: { target: "style" } });

export default function Request({ distance }: { distance: number }) {
  const { colors } = useTheme();
  const { user } = useSession();
  const { origin, destination, setDateTime, setFare } = useTrip();

  const userId = user?.id;
  const dateTime = useRef(new Date());

  // fare calculation: initial charge of €5.00 + €0.50 per km
  // it is simple and could be extended to factor in time, region, etc.
  const fare = Number((5 + distance * 0.5).toFixed(2));

  useEffect(() => {
    setDateTime(dateTime.current);
  }, [setDateTime]);

  // store the value of fare in the React context
  useEffect(() => {
    setFare(fare);
  }, [fare, setFare]);

  async function onSubmit() {
    await createTrip({
      userId: userId,
      origin: origin,
      destination: destination,
      dateTime: dateTime.current,
      fare: fare,
    });
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
