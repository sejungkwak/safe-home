import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { RadioButton } from "react-native-paper";

import fetchTrip from "@/api/trips/fetch-trip";
import ScreenContainer from "@/components/ui/screen-container";
import TripCard from "@/components/ui/trip-card";
import { useSession } from "@/context/auth";
import { useRole } from "@/context/role";
import formatDate from "@/lib/format-date";

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

  useEffect(() => {
    /**
     * Retrieves trip data, categorises them into upcoming
     * or past trips based on each trip's start time,
     * and stores them in upcomingTrips or pastTrips.
     */
    async function getTrips() {
      if (!user || !role) return;

      const data = await fetchTrip(user.id, role);

      const now = new Date();

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
              trip.start_time &&
              new Date(trip.start_time) >= now &&
              (trip.status !== "driver_cancelled" ||
                trip.status !== "rider_cancelled"),
          )
          .map((trip) => ({ ...trip, ...formatStartDate(trip.start_time) })),
      );

      // start time is in the past, or cancelled trips
      setPastTrips(
        data
          .filter(
            (trip) =>
              !trip.start_time ||
              new Date(trip.start_time) < now ||
              trip.status === "driver_cancelled" ||
              trip.status === "rider_cancelled",
          )
          .map((trip) => ({ ...trip, ...formatStartDate(trip.start_time) })),
      );
    }

    getTrips();
  }, [user, role]);

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

      <View>
        {tripsToShow.map((trip) => (
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
                trip.status === "rider_cancelled"
                  ? "car-off"
                  : "car-outline"
              }
              pickupTime={`${trip.formattedDate} ${trip.formattedTime}`}
              origin={trip.start_location.address}
              destination={trip.end_location.address}
              fare={trip.fare}
            />
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

export default TripsScreen;
