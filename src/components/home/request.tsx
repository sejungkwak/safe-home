import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { Icon, useTheme } from "react-native-paper";

import createNotification from "@/api/notifications/create-notification";
import createTrip from "@/api/trips/create-trip";
import { useSession } from "@/context/auth";
import { useTrip } from "@/context/trip";
import BaseModal from "../ui/base-modal";
import ChipButton from "../ui/chip-button";
import PrimaryButton from "../ui/primary-button";

/**
 * Handles the ride request button press:
 * Calculates the fare based on the distance,
 * updates the trip table and sends notifications to drivers.
 *
 * @param distance The distance between origin and destination in km
 * @param onReset A callback function used to clear route-related values
 */
export default function Request({
  distance,
  onReset,
}: {
  distance: number;
  onReset?: () => void;
}) {
  const { colors } = useTheme();
  const { user } = useSession();
  const { origin, destination, setDateTime, setFare, resetTrip } = useTrip();

  const userId = user?.id;
  const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
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

  /**
   * handles the Request button press.
   * creates new data entries for trip and notification tables.
   */
  async function onSubmit() {
    const newTrip = await createTrip({
      riderId: userId,
      origin: origin,
      destination: destination,
      dateTime: dateTime.current,
      fare: fare,
    });

    await createNotification({
      riderId: userId,
      origin: origin,
      destination: destination,
      dateTime: dateTime.current,
      fare: fare,
      notificationType: "ride_requested",
      tripId: newTrip.id,
    });

    setConfirmationModal(true);
  }

  return (
    <View>
      {confirmationModal && (
        <BaseModal
          title="Ride requested"
          body="You'll be notified as soon as a driver accepts your request."
          screen="/"
          onConfirm={() => {
            resetTrip();
            onReset?.();
          }}
        />
      )}
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
      <PrimaryButton onPress={onSubmit}>Request</PrimaryButton>
    </View>
  );
}
