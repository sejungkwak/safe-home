import { supabase } from "../../lib/supabase";

export type Coords = {
  latitude: number;
  longitude: number;
  address: string;
};

export type TripParams = {
  riderId: string | undefined;
  origin: Coords | null;
  destination: Coords | null;
  dateTime: Date | null;
  fare: number | null;
};

/**
 * Handles a ride request or booking confirmation button press.
 * Creates new data entry for the trip table.
 *
 * @returns Updated trip record from database
 */
export default async function createTrip({
  riderId,
  origin,
  destination,
  dateTime,
  fare,
}: TripParams) {
  if (!riderId || !origin || !destination || !dateTime || fare === null) return;

  // insert a new entry to the trip table
  const { data, error } = await supabase
    .from("trip")
    .insert({
      rider_id: riderId,
      start_location: origin,
      end_location: destination,
      start_time: dateTime,
      fare: fare,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}
