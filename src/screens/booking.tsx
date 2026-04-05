import { Text, View } from "react-native";
import { Icon, useTheme } from "react-native-paper";

import ChipButton from "@/components/ui/chip-button";
import PrimaryButton from "@/components/ui/primary-button";
import ScreenContainer from "@/components/ui/screen-container";
import { useFare } from "@/context/fare";

/**
 * Displays date and time picker buttons and the fare information
 * for users to book a ride in advance.
 */
export default function BookingScreen() {
  const { colors } = useTheme();

  // retrieve the fare information
  const { fare } = useFare();

  // create a new Date object representing the current date and time, plus one hour
  const now = new Date();
  const plusOneHour = new Date(now);
  plusOneHour.setHours(plusOneHour.getHours() + 1);

  // format date: e.g. 5 April 2026
  const date = plusOneHour.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // format time: e.g. 13:30
  const time = plusOneHour.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <ScreenContainer>
      <Text
        className="pt-8 pb-4 ps-4 text-xl"
        style={{ color: colors.onBackground }}
      >
        Book a trip from an hour to 90 days in advance!
      </Text>

      {/* Booking details (Date, Time, Fare) */}
      <View className="flex-1 justify-between">
        <View>
          <ChipButton icon="calendar-search">{date}</ChipButton>
          <ChipButton icon="clock-plus-outline">{time}</ChipButton>
          <View className="flex-row items-center gap-2 pt-4 ps-4">
            <Icon
              size={20}
              source="wallet-outline"
              color={colors.onBackground}
            ></Icon>
            <Text className="text-lg" style={{ color: colors.onBackground }}>
              €{fare}
            </Text>
          </View>
        </View>
        <PrimaryButton>Confirm</PrimaryButton>
      </View>
    </ScreenContainer>
  );
}
