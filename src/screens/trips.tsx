import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { RadioButton, Text } from "react-native-paper";

import expireTrip from "@/api/trips/expire-trip";
import fetchTrip from "@/api/trips/fetch-trip";
import ScreenContainer from "@/components/ui/screen-container";
import TripCard from "@/components/ui/trip-card";
import { useSession } from "@/context/auth";
import { useRole } from "@/context/role";
import formatDate from "@/lib/format-date";
import { supabase } from "@/lib/supabase";

type Trip = {
  id: string;
  rider_id: string | null;
  driver_id: string | null;
  start_location: { address: string };
  end_location: { address: string };
  start_time: string | null;
  end_time: string | null;
  fare: number;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  formattedDate: string;
  formattedTime: string;
};

/**
 * Displays a list of trips for the signed-in user
 * based on whether they are upcoming or past trips.
 * Navigates to the trip details screen when a trip is pressed.
 */
function TripsScreen() {
  const { user } = useSession();
  const { role } = useRole();
  const router = useRouter();
  const [timeline, setTimeline] = useState("upcoming");
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);

  /**
   * Retrieves trip data, categorises them into upcoming
   * or past trips based on each trip's start time,
   * and stores them in upcomingTrips or pastTrips.
   */
  const getTrips = useCallback(async () => {
    if (!user || !role) return;

    const data = await fetchTrip(user.id, role);

    function formatStartDate(startDate: string) {
      const { formattedDate, formattedTime } = formatDate(
        startDate ? new Date(startDate) : undefined,
      );
      return { formattedDate, formattedTime };
    }

    // start time is in the future, and not cancelled trips
    setUpcomingTrips(
      data
        .filter(
          (trip) =>
            trip.status === "pending" ||
            trip.status === "driver_accepted" ||
            trip.status === "rider_accepted" ||
            trip.status === "in_progress",
        )
        .map((trip) => ({ ...trip, ...formatStartDate(trip.start_time) })),
    );

    // start time is in the past, or cancelled trips
    setPastTrips(
      data
        .filter(
          (trip) =>
            trip.status === "completed" ||
            trip.status === "expired" ||
            trip.status === "driver_cancelled" ||
            trip.status === "rider_cancelled",
        )
        .map((trip) => ({ ...trip, ...formatStartDate(trip.start_time) })),
    );
  }, [user, role]);

  useFocusEffect(
    useCallback(() => {
      expireTrip();
      getTrips();
    }, [getTrips]),
  );

  useEffect(() => {
    if (!user) return;

    // listen to new trip or updates, and call getTrips when it happens.
    const channel = supabase
      .channel("driver-trips")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trip",
        },
        () => getTrips(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trip",
        },
        () => getTrips(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, getTrips]);

  const tripsToShow = timeline === "upcoming" ? upcomingTrips : pastTrips;

  return (
    <ScreenContainer>
      <View className="mb-4">
        <RadioButton.Group
          onValueChange={(value) => setTimeline(value)}
          value={timeline}
        >
          <View className="flex-row">
            <RadioButton.Item
              label="Upcoming"
              value="upcoming"
              mode="android"
              position="leading"
            />
            <RadioButton.Item
              label="Past"
              value="past"
              mode="android"
              position="leading"
            />
          </View>
        </RadioButton.Group>
      </View>

      <ScrollView>
        {tripsToShow.length === 0 && (
          <Text variant="titleLarge" style={{ marginLeft: 24 }}>
            You have no {timeline === "upcoming" ? "upcoming" : "past"} trips.
          </Text>
        )}

        {tripsToShow.map((trip) => {
          let options;
          if (trip.status === "expired") {
            options = "Expired";
          } else if (trip.status === "driver_cancelled") {
            options = "Driver Cancelled";
          } else if (trip.status === "rider_cancelled") {
            options = "Rider Cancelled";
          }

          return (
            <Pressable
              key={trip.id}
              // navigate the user to the details screen
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
                icon={
                  trip.status === "driver_cancelled" ||
                  trip.status === "rider_cancelled" ||
                  trip.status === "expired"
                    ? "car-off"
                    : "car-outline"
                }
                pickupTime={`${trip.formattedDate} ${trip.formattedTime}`}
                options={options}
                origin={trip.start_location.address}
                destination={trip.end_location.address}
                fare={trip.fare}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

export default TripsScreen;
