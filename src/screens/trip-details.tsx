import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "react-native-paper";

import createNotification from "@/api/notifications/create-notification";
import cancelTrip from "@/api/trips/cancel-trip";
import { Coords } from "@/api/trips/create-trip";
import updateTrip from "@/api/trips/update-trip";
import Map from "@/components/map/map";
import BaseModal from "@/components/ui/base-modal";
import ChipButton from "@/components/ui/chip-button";
import PrimaryButton from "@/components/ui/primary-button";
import RouteField from "@/components/ui/route-field";
import ScreenContainer from "@/components/ui/screen-container";
import TripInfoItem from "@/components/ui/trip-info-item";
import { useSession } from "@/context/auth";
import formatDate from "@/lib/format-date";
import { supabase } from "@/lib/supabase";

cssInterop(GestureHandlerRootView, { className: { target: "style" } });
cssInterop(BottomSheetView, { className: { target: "style" } });
cssInterop(ChipButton, { className: { target: "style" } });

export default function TripDetails() {
  const { user } = useSession();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  // store the trip details in state
  const [riderId, setRiderId] = useState<string | null>(null);
  const [riderName, setRiderName] = useState<string | null>(null);
  const [riderPushToken, setRiderPushToken] = useState<string | null>(null);
  const [reg, setReg] = useState<string | null>(null);
  const [transmission, setTransmission] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [driverPushToken, setDriverPushToken] = useState<string | null>(null);
  const [pickupTime, setPickupTime] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [destination, setDestination] = useState<Coords | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const [showAcceptModal, setShowAcceptModal] = useState<boolean>(false);
  const [showRiderCancelModal, setShowRiderCancelModal] =
    useState<boolean>(false);
  const [showRiderConfirmModal, setShowRiderConfirmModal] =
    useState<boolean>(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // retrieve the trip information based on the id
  useEffect(() => {
    let isMounted = true;
    const getTripData = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("trip")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return;

      // get rider name and vehicle information
      const { data: riderData, error: riderError } = await supabase
        .from("profile")
        .select(
          "id, name, expo_push_token, vehicle:vehicle_id (reg, transmission_type)",
        )
        .eq("id", data.rider_id)
        .single();

      if (riderError) throw riderError;
      if (!riderData) return;

      // get driver name
      // driver field is empty when the status is pending
      if (data.status !== "pending") {
        const { data: driverData, error: driverError } = await supabase
          .from("profile")
          .select("id, name, expo_push_token")
          .eq("id", data.driver_id)
          .single();

        if (driverError) throw driverError;
        if (driverData && isMounted) {
          setDriverId(driverData.id);
          setDriverName(driverData.name);
          setDriverPushToken(driverData.expo_push_token);
        }
      }

      if (isMounted) {
        const start_time = new Date(data.start_time);
        const { formattedDate, formattedTime } = formatDate(start_time);
        const stringifiedTime = formattedDate + "  " + formattedTime;

        setRiderId(riderData.id);
        setRiderName(riderData.name);
        setRiderPushToken(riderData.expo_push_token);
        setReg(data.vehicle?.reg);
        setTransmission(data.vehicle?.transmission_type);
        setOrigin(data.start_location);
        setDestination(data.end_location);
        setPickupTime(stringifiedTime);
        setDateTime(start_time);
        setFare(data.fare);
        setStatus(data.status);
      }
    };

    getTripData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  /**
   * Handles Accept button press by a driver:
   * Updates the matching row in the trip table,
   * and creates a new data entry for the notification table.
   */
  async function handleAccept() {
    // update trip table
    const { error } = await supabase
      .from("trip")
      .update({
        driver_id: user?.id,
        status: "driver_accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
    setShowAcceptModal(true);

    // create a new notification data entry
    await createNotification({
      riderId: riderId ?? "",
      driverId: user?.id ?? "",
      pushToken: riderPushToken ?? "",
      origin: origin,
      destination: destination,
      dateTime: dateTime,
      notificationType: "driver_accepted",
      tripId: id,
      fare: fare,
    });
  }

  /**
   * Handles Cancel Request button press by a rider:
   * Updates the matching row in the trip table,
   * and creates a new data entry for the notification table.
   */
  async function handleRiderCancel() {
    // update the trip table
    const data = await cancelTrip(id, "rider");

    if (!data) Alert.alert("Something went wrong", "Please try again.");

    // create a new notification data entry
    await createNotification({
      riderId: riderId ?? "",
      driverId: driverId ?? "",
      pushToken: driverPushToken ?? "",
      origin: origin,
      destination: destination,
      dateTime: dateTime,
      notificationType: "rider_cancelled",
      tripId: id,
      fare: fare,
    });

    setShowRiderCancelModal(true);
  }

  /**
   * Handles Confirm Request button press by a rider:
   * Updates the matching row in the trip table,
   * creates a new data entry for the notification table,
   * and show a confirmation modal.
   */
  async function handleRiderConfirm() {
    // update the trip table
    const data = await updateTrip(id, "rider_accepted");

    if (!data) Alert.alert("Something went wrong", "Please try again.");

    // create a new notification data entry
    await createNotification({
      riderId: riderId ?? "",
      driverId: driverId ?? "",
      pushToken: driverPushToken ?? "",
      origin: origin,
      destination: destination,
      dateTime: dateTime,
      notificationType: "rider_accepted",
      tripId: id,
      fare: fare,
    });

    // show modal
    setShowRiderConfirmModal(true);
  }

  return (
    <ScreenContainer>
      {showAcceptModal && (
        <BaseModal
          title="Acceptance received"
          body="We're notifying the rider now."
          screen="/home"
        />
      )}
      {showRiderCancelModal && (
        <BaseModal
          title="Request cancelled"
          body="This trip request has been cancelled successfully."
          screen="/home"
        />
      )}
      {showRiderConfirmModal && (
        <BaseModal
          title="Request confirmed"
          body="We're notifying the driver now."
          screen="/home"
        />
      )}
      <Map
        pickUpCoords={origin}
        dropOffCoords={destination}
        onReady={(result) => setDistance(result.distance)}
      />

      <GestureHandlerRootView className="flex-1">
        <BottomSheet
          ref={bottomSheetRef}
          backgroundStyle={{ backgroundColor: colors.background }}
          enableDynamicSizing={true}
        >
          <BottomSheetView className="mx-2 pb-4">
            <RouteField
              origin={origin?.address ?? null}
              destination={destination?.address ?? null}
            />

            {/* Driver view */}
            {((!driverName && status === "pending" && user?.id !== riderId) ||
              (user?.id === driverId && status === "rider_accepted")) && (
              <>
                <ChipButton
                  icon="account-circle-outline"
                  // TODO display user info on press
                  onPress={() => {
                    console.log("rider button");
                  }}
                >
                  {riderName}
                </ChipButton>

                {reg && transmission && (
                  <TripInfoItem
                    icon="car"
                    infoText={`${reg} (${transmission})`}
                  />
                )}

                <TripInfoItem icon="wallet-outline" infoText={`€${fare}`} />

                {distance && (
                  <TripInfoItem
                    icon="map-marker-distance"
                    infoText={`${distance.toFixed(1)} km`}
                  />
                )}
                <TripInfoItem
                  icon="calendar-outline"
                  infoText={pickupTime ?? ""}
                />
              </>
            )}

            {!driverName && status === "pending" && user?.id !== riderId && (
              <PrimaryButton onPress={handleAccept}>Accept</PrimaryButton>
            )}

            {/* Rider view */}
            {user?.id === riderId && status === "driver_accepted" && (
              <>
                <ChipButton
                  icon="account-circle-outline"
                  // TODO display driver info on press
                  onPress={() => {
                    console.log("driver button");
                  }}
                >
                  {driverName}
                </ChipButton>
                <View className="flex-row gap-4">
                  <PrimaryButton mode="outlined" onPress={handleRiderCancel}>
                    Cancel Request
                  </PrimaryButton>
                  <PrimaryButton onPress={handleRiderConfirm}>
                    Confirm
                  </PrimaryButton>
                </View>
              </>
            )}
            {/* TODO driver name with button "Cancel" and "Confirm" */}

            {user?.id === riderId && status === "rider_accepted"}
            {/* TODO "Cancel trip" button */}

            {user?.id === riderId && status === "completed"}
            {/* TODO rating option */}
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </ScreenContainer>
  );
}
