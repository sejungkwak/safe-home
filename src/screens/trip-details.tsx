import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "react-native-paper";

import createNotification from "@/api/notifications/create-notification";
import createRating from "@/api/ratings/create-rating";
import fetchRating from "@/api/ratings/fetch-rating";
import cancelTrip from "@/api/trips/cancel-trip";
import { Coords } from "@/api/trips/create-trip";
import updateTrip from "@/api/trips/update-trip";
import Map from "@/components/map/map";
import BaseModal from "@/components/ui/base-modal";
import ChipButton from "@/components/ui/chip-button";
import PrimaryButton from "@/components/ui/primary-button";
import Ratings from "@/components/ui/ratings";
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
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showRiderConfirmModal, setShowRiderConfirmModal] =
    useState<boolean>(false);
  const [hasRating, setHasRating] = useState<boolean>(false);
  const [sheetHeight, setSheetHeight] = useState<number>(0);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // retrieve the trip information based on the id
  useEffect(() => {
    let isMounted = true;
    async function getTripData() {
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
      // driver field is empty when the status is pending or expired
      if (
        data.driver_id &&
        (data.status !== "pending" || data.status !== "expired")
      ) {
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
    }

    getTripData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    // check if the rider has already given a rating
    // if they have, the rating widget is read-only.
    async function getRating() {
      if (user?.id === riderId) {
        if (!driverId || !isMounted) return;
        const data = await fetchRating(driverId, id);
        if (data.length === 0) setHasRating(false);
        if (data.length > 0) setHasRating(true);
      }
      if (user?.id === driverId) {
        if (!riderId || !isMounted) return;
        const data = await fetchRating(riderId, id);
        if (data.length === 0) setHasRating(false);
        if (data.length > 0) setHasRating(true);
      }
    }

    getRating();

    return () => {
      isMounted = false;
    };
  }, [driverId, riderId, user?.id, id]);

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
   * Handles the Start Trip button press by a driver:
   * Updates the matching row in the trip table.
   */
  async function handleStartTrip() {
    await updateTrip(id, "in_progress");
    setStatus("in_progress");
  }

  /**
   * Handles the Complete Trip button press by a driver:
   * Updates the matching row in the trip table.
   */
  async function handleCompleteTrip() {
    await updateTrip(id, "completed");
    setStatus("completed");
  }

  /**
   * Handles the trip cancel button by a driver:
   * Updates the trip table, creates a new row by running security definer function,
   * and create a new entry in notification table to send notification to other drivers.
   */
  async function handleDriverCancel() {
    if (
      !riderId ||
      !driverId ||
      !riderPushToken ||
      !origin ||
      !destination ||
      !dateTime
    )
      return;

    const { data, error } = await supabase.rpc("driver_cancel_and_rebook", {
      cancelled_trip_id: id,
      start_location: origin,
      end_location: destination,
      start_time: dateTime.toISOString(),
    });

    if (error) {
      Alert.alert("Something went wrong", "Please try again.");
      return;
    }

    const newTripId = data.new_trip_id;

    // send notifications to other drivers
    await createNotification({
      riderId: riderId,
      origin: origin,
      destination: destination,
      dateTime: dateTime,
      notificationType: "pending",
      tripId: newTripId,
      fare: fare,
    });

    // send a notification to the rider
    await createNotification({
      riderId: riderId,
      driverId: driverId,
      pushToken: riderPushToken,
      origin: origin,
      destination: destination,
      dateTime: dateTime,
      notificationType: "driver_cancelled",
      tripId: newTripId,
      fare: fare,
    });

    setShowCancelModal(true);
  }

  /**
   * Handles Cancel Request button press by a rider:
   * Updates the matching row in the trip table,
   * and creates a new data entry for the notification table.
   */
  async function handleRiderCancel() {
    // update the trip table
    const data = await cancelTrip(id, "rider");

    if (!data) {
      Alert.alert("Something went wrong", "Please try again.");
      return;
    }

    setShowCancelModal(true);

    if (!driverId) return;

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

  /**
   * Handles a rating submission button press:
   * creates a new data entry in the rating table
   * @param rating The rating a user has given
   */
  async function handleRatingSubmit(rating: number) {
    if (!user || !driverId || !riderId) return;

    if (user.id === riderId) {
      await createRating(id, driverId, rating);
    }

    if (user.id === driverId) {
      await createRating(id, riderId, rating);
    }
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
      {showCancelModal && (
        <BaseModal
          title="Trip cancelled"
          body="This trip has been cancelled successfully."
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

      <GestureHandlerRootView className="flex-1">
        <Map
          pickUpCoords={origin}
          dropOffCoords={destination}
          bottomPadding={sheetHeight}
          onReady={(result) => setDistance(result.distance)}
        />
        <BottomSheet
          ref={bottomSheetRef}
          backgroundStyle={{ backgroundColor: colors.background }}
          enableDynamicSizing={true}
        >
          <BottomSheetView
            className="pb-4"
            onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
          >
            <RouteField
              origin={origin?.address ?? null}
              destination={destination?.address ?? null}
            />

            {/* Driver view */}
            {((!driverName && status === "pending" && user?.id !== riderId) ||
              (user?.id === driverId &&
                (status === "driver_accepted" ||
                  status === "rider_accepted" ||
                  status === "in_progress" ||
                  status === "completed"))) && (
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

                {status === "pending" && (
                  <PrimaryButton onPress={handleAccept}>Accept</PrimaryButton>
                )}

                {status === "driver_accepted" && (
                  <PrimaryButton onPress={handleDriverCancel}>
                    Cancel
                  </PrimaryButton>
                )}

                {status === "rider_accepted" && (
                  <View className="flex-row gap-4 me-2">
                    <PrimaryButton mode="outlined" onPress={handleDriverCancel}>
                      Cancel
                    </PrimaryButton>
                    <PrimaryButton
                      onPress={handleStartTrip}
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      Start Trip
                    </PrimaryButton>
                  </View>
                )}

                {status === "in_progress" && (
                  <PrimaryButton onPress={handleCompleteTrip}>
                    Complete Trip
                  </PrimaryButton>
                )}

                {status === "completed" && (
                  <>
                    {hasRating && (
                      <Ratings
                        name={riderName ?? "the rider"}
                        readOnly={true}
                      ></Ratings>
                    )}
                    {!hasRating && (
                      <Ratings
                        name={riderName ?? "the rider"}
                        readOnly={false}
                        onFinish={handleRatingSubmit}
                      ></Ratings>
                    )}
                  </>
                )}
              </>
            )}

            {/* Rider view */}
            {user?.id === riderId && driverName && (
              <ChipButton
                icon="account-circle-outline"
                // TODO display driver info on press
                onPress={() => {
                  console.log("driver button");
                }}
              >
                {driverName}
              </ChipButton>
            )}

            {user?.id === riderId && status === "driver_accepted" && (
              <View className="flex-row gap-4 me-2">
                <PrimaryButton mode="outlined" onPress={handleRiderCancel}>
                  Cancel Request
                </PrimaryButton>
                <PrimaryButton
                  onPress={handleRiderConfirm}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Confirm
                </PrimaryButton>
              </View>
            )}

            {user?.id === riderId && status === "pending" && (
              <View className="mt-4">
                <PrimaryButton mode="outlined" onPress={handleRiderCancel}>
                  Cancel Request
                </PrimaryButton>
              </View>
            )}

            {user?.id === riderId && status === "rider_accepted" && (
              <PrimaryButton mode="outlined" onPress={handleRiderCancel}>
                Cancel Request
              </PrimaryButton>
            )}

            {user?.id === riderId && status === "completed" && (
              <>
                <TripInfoItem icon="wallet-outline" infoText={`€${fare}`} />
                <TripInfoItem
                  icon="calendar-outline"
                  infoText={pickupTime ?? ""}
                />
                {hasRating && (
                  <Ratings
                    name={driverName ?? "the driver"}
                    readOnly={true}
                  ></Ratings>
                )}
                {!hasRating && (
                  <Ratings
                    name={driverName ?? "the driver"}
                    readOnly={false}
                    onFinish={handleRatingSubmit}
                  ></Ratings>
                )}
              </>
            )}
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </ScreenContainer>
  );
}
