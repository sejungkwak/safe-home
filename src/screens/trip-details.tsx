import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "react-native-paper";

import createNotification from "@/api/notifications/create-notification";
import fetchProfile from "@/api/profiles/fetch-profile";
import createRating from "@/api/ratings/create-rating";
import fetchRating from "@/api/ratings/fetch-rating";
import cancelTrip from "@/api/trips/cancel-trip";
import createTrip, { Coords } from "@/api/trips/create-trip";
import updateTrip from "@/api/trips/update-trip";
import Map from "@/components/map/map";
import BaseModal from "@/components/ui/base-modal";
import ChipButton from "@/components/ui/chip-button";
import PrimaryButton from "@/components/ui/primary-button";
import Ratings from "@/components/ui/ratings";
import RouteField from "@/components/ui/route-field";
import ScreenContainer from "@/components/ui/screen-container";
import TripInfoItem from "@/components/ui/trip-info-item";
import UserInfoModal from "@/components/ui/user-info-modal";
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

  // store the user and trip details in state
  const [riderId, setRiderId] = useState<string | null>(null);
  const [riderName, setRiderName] = useState<string | null>(null);
  const [riderPhone, setRiderPhone] = useState<string | null>(null);
  const [riderProfilePhotoUrl, setRiderProfilePhotoUrl] = useState<
    string | null
  >(null);
  const [riderRating, setRiderRating] = useState<number | undefined>(undefined);
  const [riderAverageRating, setRiderAverageRating] = useState<number | null>(
    null,
  );
  const [riderPushToken, setRiderPushToken] = useState<string | null>(null);
  const [reg, setReg] = useState<string | null>(null);
  const [transmission, setTransmission] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [driverPhone, setDriverPhone] = useState<string | null>(null);
  const [driverProfilePhotoUrl, setDriverProfilePhotoUrl] = useState<
    string | null
  >(null);
  const [driverRating, setDriverRating] = useState<number | undefined>(
    undefined,
  );
  const [driverAverageRating, setDriverAverageRating] = useState<number | null>(
    null,
  );
  const [driverPushToken, setDriverPushToken] = useState<string | null>(null);
  const [pickupTime, setPickupTime] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [destination, setDestination] = useState<Coords | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const [showRiderInfoModal, setShowRiderInfoModal] = useState<boolean>(false);
  const [showDriverInfoModal, setShowDriverInfoModal] =
    useState<boolean>(false);
  const [showAcceptModal, setShowAcceptModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showRiderConfirmModal, setShowRiderConfirmModal] =
    useState<boolean>(false);
  const [hasRating, setHasRating] = useState<boolean>(false);
  const [sheetHeight, setSheetHeight] = useState<number>(0);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    let isMounted = true;
    async function getTripData() {
      if (!id) return;

      // retrieve the trip information based on the id
      const { data, error } = await supabase
        .from("trip")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return;

      // get rider name and vehicle information
      const riderData = await fetchProfile(data.rider_id);

      if (!riderData) return;

      if (riderData.profile_photo) {
        const { data: photoData } = supabase.storage
          .from("profiles")
          .getPublicUrl(riderData.profile_photo);
        if (isMounted) setRiderProfilePhotoUrl(photoData.publicUrl);
      }

      const ratingRows = await fetchRating(riderData.id);
      if (isMounted && ratingRows.length > 0) {
        const avg =
          ratingRows.reduce(
            (sum: number, row: { rating: number }) => sum + row.rating,
            0,
          ) / ratingRows.length;
        setRiderAverageRating(avg);
      }

      const riderSingleRating = await fetchRating(riderData.id, id);
      if (isMounted && riderSingleRating)
        setRiderRating(riderSingleRating.rating);

      // get driver name
      // driver field is empty when the status is pending or expired
      if (
        data.driver_id &&
        (data.status !== "pending" || data.status !== "expired")
      ) {
        const driverData = await fetchProfile(data.driver_id);
        if (driverData && isMounted) {
          setDriverId(driverData.id);
          setDriverName(driverData.name);
          setDriverPhone(driverData.phone);
          setDriverPushToken(driverData.expo_push_token);
        }

        if (driverData.profile_photo) {
          const { data: photoData } = supabase.storage
            .from("profiles")
            .getPublicUrl(driverData.profile_photo);
          if (isMounted) setDriverProfilePhotoUrl(photoData.publicUrl);
        }

        const ratingRows = await fetchRating(driverData.id);
        if (isMounted && ratingRows.length > 0) {
          const avg =
            ratingRows.reduce(
              (sum: number, row: { rating: number }) => sum + row.rating,
              0,
            ) / ratingRows.length;
          setDriverAverageRating(avg);
        }

        const driverSingleRating = await fetchRating(driverData.id, id);
        if (isMounted && driverSingleRating)
          setDriverRating(driverSingleRating.rating);
      }

      if (isMounted) {
        const start_time = new Date(data.start_time);
        const { formattedDate, formattedTime } = formatDate(start_time);
        const stringifiedTime = formattedDate + "  " + formattedTime;

        setRiderId(riderData.id);
        setRiderName(riderData.name);
        setRiderPhone(riderData.phone);
        setRiderPushToken(riderData.expo_push_token);
        setReg(riderData.vehicle?.reg);
        setTransmission(
          riderData.vehicle?.transmission_type.charAt(0).toUpperCase() +
            riderData.vehicle?.transmission_type.slice(1),
        );
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
        if (isMounted) setHasRating(data !== null);
      }
      if (user?.id === driverId) {
        if (!riderId || !isMounted) return;
        const data = await fetchRating(riderId, id);
        if (isMounted) setHasRating(data !== null);
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
   * Updates the current row and creates a new row in the trip table,
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

    const updatedData = await updateTrip(id, "driver_cancelled", driverId);

    if (!updatedData) {
      Alert.alert("Something went wrong", "Please try again.");
      return;
    }

    // create a new entry in the trip table
    const data = await createTrip({
      riderId,
      origin,
      destination,
      dateTime,
      fare,
    });

    if (!data) {
      Alert.alert("Something went wrong", "Please try again.");
      return;
    }

    const newTripId = data.id;

    // send a notification to the rider and other drivers
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
      setDriverRating(rating);
    }

    if (user.id === driverId) {
      await createRating(id, riderId, rating);
      setRiderRating(rating);
    }

    setHasRating(true);
  }

  return (
    <ScreenContainer>
      {showRiderInfoModal && (
        <UserInfoModal
          visible={showRiderInfoModal}
          name={riderName}
          phone={riderPhone}
          profilePhotoUrl={riderProfilePhotoUrl}
          averageRating={riderAverageRating}
          onDismiss={() => setShowRiderInfoModal(false)}
        />
      )}
      {showDriverInfoModal && (
        <UserInfoModal
          visible={showDriverInfoModal}
          name={driverName}
          phone={driverPhone}
          profilePhotoUrl={driverProfilePhotoUrl}
          averageRating={driverAverageRating}
          onDismiss={() => setShowDriverInfoModal(false)}
        />
      )}
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
                  onPress={() => setShowRiderInfoModal(true)}
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
                        savedRating={riderRating}
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
                onPress={() => {
                  setShowDriverInfoModal(true);
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
                    savedRating={driverRating}
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
