import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { Button, Icon, useTheme } from "react-native-paper";

import createNotification from "@/api/notifications/create-notification";
import fetchProfile from "@/api/profiles/fetch-profile";
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
  const [reg, setReg] = useState<string | undefined>(undefined);
  const [transmission, setTransmission] = useState<string | undefined>(
    undefined,
  );
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

  useFocusEffect(
    useCallback(() => {
      async function getReg() {
        if (!user) return;
        const userProfile = await fetchProfile(user.id);
        if (!userProfile?.vehicle) return;
        setReg(userProfile.vehicle.reg);
        setTransmission(userProfile.vehicle.transmission_type);
      }
      getReg();
    }, [user]),
  );

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
        <Icon size={36} source="car" color={colors.onSurface} />
        {reg && transmission ? (
          <View className="flex-col items-start">
            <Text
              className="mt-3 ms-3 text-lg"
              style={{ color: colors.onSurface }}
            >
              {reg} ({transmission[0].toUpperCase() + transmission.slice(1)})
            </Text>
            <Button
              textColor={colors.primary}
              labelStyle={{ marginTop: 0 }}
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/account",
                  params: { focus: "vehicleReg" },
                });
              }}
            >
              Edit my vehicle
            </Button>
          </View>
        ) : (
          <View>
            <Button
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/account",
                  params: { focus: "vehicleReg" },
                });
              }}
            >
              Add your vehicle to request a driver
            </Button>
          </View>
        )}
      </View>
      <View className="mb-4">
        <ChipButton icon="wallet-outline">€{fare} (Cash)</ChipButton>
      </View>
      <PrimaryButton disabled={!reg} onPress={onSubmit}>
        Request
      </PrimaryButton>
    </View>
  );
}
