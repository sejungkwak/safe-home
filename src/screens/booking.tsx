import { useState } from "react";
import { Text, View } from "react-native";
import { Icon, useTheme } from "react-native-paper";

import createNotification from "@/api/notifications/create-notification";
import createTrip from "@/api/trips/create-trip";
import BookingDateTimePicker from "@/components/home/booking-date-time-picker";
import BaseModal from "@/components/ui/base-modal";
import ChipButton from "@/components/ui/chip-button";
import PrimaryButton from "@/components/ui/primary-button";
import ScreenContainer from "@/components/ui/screen-container";
import { useSession } from "@/context/auth";
import { useTrip } from "@/context/trip";
import formatDate from "@/lib/format-date";

/**
 * Displays date and time picker buttons and the fare information
 * for users to book a ride in advance.
 *
 * @param onReset A callback function used to clear route-related values
 */
export default function BookingScreen({ onReset }: { onReset?: () => void }) {
  const { colors } = useTheme();
  const { user } = useSession();
  const { origin, destination, fare, dateTime, resetTrip } = useTrip();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // set the default date and time to the formatted current date and time
  const { formattedDate, formattedTime } = formatDate();
  const [date, setDate] = useState<string>(formattedDate);
  const [time, setTime] = useState<string>(formattedTime);
  const [errorModal, setErrorModal] = useState<boolean>(false);
  const [confirmationModal, setConfirmationModal] = useState<boolean>(false);

  const userId = user?.id;

  /**
   * Verifies the entered time is more than one hour from now.
   *
   * @param dateTime The date and time that a user entered to book
   * @returns boolean True if dateTime is more than one hour from now
   */
  function validateBookingTime(dateTime: Date) {
    const enteredDateTime = new Date(dateTime).getTime();
    const now = Date.now();

    return enteredDateTime > now + 60 * 60 * 1000;
  }

  /**
   * handles the Confirm button press.
   * validate if the entered time is more than one hour from now, and
   * creates new data entries for trip and notification tables.
   */
  async function onSubmit() {
    if (!dateTime) return;

    const isValid = validateBookingTime(dateTime);
    if (!isValid) {
      setErrorModal(true);
      return;
    }

    const newTrip = await createTrip({
      riderId: userId,
      origin: origin,
      destination: destination,
      dateTime: dateTime,
      fare: fare,
    });

    await createNotification({
      riderId: userId,
      origin: origin,
      destination: destination,
      dateTime: dateTime,
      fare: fare,
      notificationType: "ride_requested",
      tripId: newTrip.id,
    });

    setConfirmationModal(true);
  }

  return (
    <ScreenContainer>
      {confirmationModal && (
        <BaseModal
          title="Ride requested"
          body="You'll be notified as soon as a driver accepts your request."
          screen="/home"
          onConfirm={() => {
            resetTrip();
            onReset?.();
            setConfirmationModal(false);
          }}
        />
      )}
      {errorModal && (
        <BaseModal
          title="Invalid booking time"
          body="Please choose a time from an hour from now"
          screen="/booking"
          onConfirm={() => setErrorModal(false)}
        />
      )}
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
        <PrimaryButton
          style={{
            justifyContent: "center",
            marginInline: 10,
            marginBottom: 20,
          }}
          onPress={onSubmit}
        >
          Confirm
        </PrimaryButton>
      </View>
    </ScreenContainer>
  );
}
