import { useState } from "react";
import { Text, View } from "react-native";
import { Icon, useTheme } from "react-native-paper";

import BookingDateTimePicker from "@/components/home/booking-date-time-picker";
import DateFormatter from "@/components/home/date-formatter";
import ChipButton from "@/components/ui/chip-button";
import PrimaryButton from "@/components/ui/primary-button";
import ScreenContainer from "@/components/ui/screen-container";
import { useSession } from "@/context/auth";
import { useTrip } from "@/context/trip";
import createTrip from "@/lib/create-trip";

/**
 * Displays date and time picker buttons and the fare information
 * for users to book a ride in advance.
 */
export default function BookingScreen() {
  const { colors } = useTheme();
  const { user } = useSession();
  const { origin, destination, fare, dateTime } = useTrip();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // set the default date and time to the formatted current date and time
  const { formattedDate, formattedTime } = DateFormatter();
  const [date, setDate] = useState<string>(formattedDate);
  const [time, setTime] = useState<string>(formattedTime);

  const userId = user?.id;

  async function onSubmit() {
    await createTrip({
      userId: userId,
      origin: origin,
      destination: destination,
      dateTime: dateTime,
      fare: fare,
    });
  }

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
          <ChipButton
            icon="calendar-search"
            onPress={() => {
              setShowDatePicker(true);
              setShowTimePicker(false);
            }}
          >
            {date}
          </ChipButton>
          <ChipButton
            icon="clock-plus-outline"
            onPress={() => {
              setShowTimePicker(true);
              setShowDatePicker(false);
            }}
          >
            {time}
          </ChipButton>
          {showDatePicker && (
            <BookingDateTimePicker
              pickerType="date"
              onClose={() => setShowDatePicker(false)}
              selectedValue={setDate}
            />
          )}
          {showTimePicker && (
            <BookingDateTimePicker
              pickerType="time"
              onClose={() => setShowTimePicker(false)}
              selectedValue={setTime}
            />
          )}
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
        <PrimaryButton onPress={onSubmit}>Confirm</PrimaryButton>
      </View>
    </ScreenContainer>
  );
}
