import { useEffect, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { Text } from "react-native-paper";

import { supabase } from "@/lib/supabase";
import TripCard from "../ui/trip-card";

/**
 * Retrieves and displays a list of pending ride requests from database
 */
export default function RequestList() {
  const [trips, setTrips] = useState<
    {
      id: string;
      rider_id: string;
      start_location: string;
      end_location: string;
      start_time: Date;
      fare: number;
      status: string;
      leftText: string;
    }[]
  >([]);

  useEffect(() => {
    // retrieve pending trip data
    const fetchTrips = async () => {
      const { data, error } = await supabase
        .from("trip")
        .select(
          "id, rider_id, start_location, end_location, start_time, fare, status",
        )
        .eq("status", "pending")
        .order("start_time");

      if (error) throw error;

      if (!data || data.length === 0) return;

      // filter trips whose start time is within the last 30 minutes or later
      // 30 minutes is arbitrary, but it allows recently added trip requests
      // to remain visible, since start_time is set to the request time.
      const validList = data.filter((row) => {
        const startTime = new Date(row.start_time).getTime();
        const now = Date.now();

        return startTime >= now - 30 * 60 * 1000;
      });

      return validList.map((row) => {
        const startTime = new Date(row.start_time).getTime();
        const now = Date.now();

        const past30 = now - 30 * 60 * 1000; // 30 minutes ago
        const future59 = now + 59 * 60 * 1000; // 59 minutes later

        return {
          ...row,
          start_time: new Date(startTime),
          // label trips as "ASAP" if the start time is between 30 minutes ago
          // and 59 minutes from now, label "Later" otherwise.
          leftText:
            startTime >= past30 && startTime <= future59 ? "ASAP" : "Later",
        };
      });
    };

    fetchTrips().then((data) => {
      if (data) {
        setTrips(data);
      }
    });
  }, []);

  return (
    <ScrollView className="mt-4">
      {trips.length > 0 && (
        <>
          {trips.map((trip) => (
            // TODO redirect to the details screen after creating it
            <Pressable key={trip.id} onPress={() => {}}>
              <TripCard
                key={trip.id}
                pickupTiming={trip.leftText}
                pickupTime={trip.start_time.toLocaleString()}
                origin={trip.start_location}
                destination={trip.end_location}
                fare={trip.fare}
              />
            </Pressable>
          ))}
        </>
      )}
      {trips.length === 0 && <Text>No ride requests right now.</Text>}
    </ScrollView>
  );
}
