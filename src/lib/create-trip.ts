import { supabase } from "./supabase";

export type Coords = {
  latitude: number;
  longitude: number;
  address: string;
};

export type TripParams = {
    userId: string | undefined;
    origin: Coords | null;
    destination: Coords | null;
    dateTime: Date | null;
    fare: number | null;
}

/**
 * Handles a ride request or booking confirmation button press.
 * Creates new data entry for the trip table.
 * 
 * @returns Updated trip record from database
 */
export default async function createTrip ({userId, origin, destination, dateTime, fare}: TripParams) {

    if (!userId || !origin || !destination || !dateTime || fare === null) return;

    // insert a new entry to the trip table
    const { data, error } = await supabase.from("trip").insert({
        rider_id: userId,
        start_location: origin.address,
        end_location: destination.address,
        start_time: dateTime,
        fare: fare,
    }).select().single();

    if (error) throw error;

    return data;
}
