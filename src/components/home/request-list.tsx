import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "react-native-paper";

import createNotification from "@/api/notifications/create-notification";
import fetchProfile from "@/api/profiles/fetch-profile";
import { Coords } from "@/api/trips/create-trip";
import expireTrip from "@/api/trips/expire-trip";
import fetchTrip from "@/api/trips/fetch-trip";
import TripCard from "@/components/ui/trip-card";
import formatDate from "@/lib/format-date";
import { supabase } from "@/lib/supabase";

/**
 * Retrieves and displays a list of pending ride requests from database
 */
export default function RequestList({ verifStatus }: { verifStatus: boolean }) {
  const router = useRouter();
  const [trips, setTrips] = useState<
    {
      id: string;
      rider_id: string;
      start_location: Coords;
      end_location: Coords;
      start_time: Date;
      fare: number;
      status: string;
      leftText: string;
    }[]
  >([]);

  // retrieve pending trip data
  const fetchTrips = useCallback(async () => {
    // expire pending or accepted trips whose
    // start_time is more than an hour ago
    const expiredTrips = await expireTrip();

    // if trips are expired, insert new entries into notification table
    if (expiredTrips && expiredTrips.length > 0) {
      await Promise.all(
        expiredTrips.map(async (trip) => {
          const riderId = trip.rider_id;
          const origin = trip.start_location.address;
          const destination = trip.end_location.address;
          const dateTime = trip.start_time;
          const notificationType = "expired";
          const tripId = trip.id;
          const fare = trip.fare;

          const profileData = await fetchProfile(riderId);
          const pushToken = profileData.expo_push_token;
          if (!pushToken) return;
          await createNotification({
            riderId,
            pushToken,
            origin,
            destination,
            dateTime,
            notificationType,
            tripId,
            fare,
          });
        }),
      );
    }

    const data = await fetchTrip("status", "pending", true);

    if (!data || data.length === 0) {
      setTrips([]);
      return;
    }

    setTrips(
      data.map((row) => {
        const startTime = new Date(row.start_time).getTime();
        const now = Date.now();

        const past60 = now - 60 * 60 * 1000; // 60 minutes ago
        const future59 = now + 59 * 60 * 1000; // 59 minutes later

        const { formattedDate, formattedTime } = formatDate(
          new Date(startTime),
        );

        return {
          ...row,
          start_time: `${formattedDate} ${formattedTime}`,
          // label trips as "ASAP" if the start time is between 60 minutes ago
          // and 59 minutes from now, label "Later" otherwise.
          leftText:
            startTime >= past60 && startTime <= future59 ? "ASAP" : "Later",
        };
      }),
    );
  }, []);

  useEffect(() => {
    fetchTrips();

    // listen to new trip or updates, and call fetchTrips when it happens.
    const channel = supabase
      .channel(`pending-trips-${Date.now() + Math.random()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "trip" },
        () => fetchTrips(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "trip" },
        () => fetchTrips(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTrips]);

  // show a message if the driver account is not verified.
  if (!verifStatus) {
    return (
      <View className="m-4 gap-2">
        <Text variant="titleLarge">
          No trip requests are available because your driver account is not
          verified.
        </Text>
        <Text variant="titleLarge">
          Please wait for verification, or upload a valid driving license for
          verification.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="mt-4">
      {trips.length > 0 && (
        <>
          {trips.map((trip) => (
            <Pressable
              key={trip.id}
              // redirect the driver to the details screen
              onPress={() => {
                router.push({
                  pathname: "/trip-details",
                  params: {
                    id: trip.id,
                  },
                });
              }}
            >
              <TripCard
                key={trip.id}
                pickupTiming={trip.leftText}
                pickupTime={trip.start_time.toLocaleString()}
                origin={trip.start_location.address}
                destination={trip.end_location.address}
                fare={trip.fare}
              />
            </Pressable>
          ))}
        </>
      )}
      {trips.length === 0 && (
        <Text variant="titleLarge" style={{ marginLeft: 24 }}>
          No ride requests right now.
        </Text>
      )}
    </ScrollView>
  );
}
