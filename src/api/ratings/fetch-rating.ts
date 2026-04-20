import { supabase } from "../../lib/supabase";

/**
 * Retrieves rating data for a user.
 *
 * @param userId The user id used to look up ratings
 * @param tripId The trip id associated with the user whose ratings are being looked up
 * @returns An array containing the retrieved rating data
 */
export default async function fetchRating(userId: string, tripId?: string) {
  if (tripId) {
    // this is used to verify whether a rating already exists for the given trip
    // if it does, the rating is read-only.
    const { data, error } = await supabase
      .from("rating")
      .select("*")
      .match({ trip_id: tripId, user_id: userId });

    if (error) throw error;

    return data;
  } else {
    const { data, error } = await supabase
      .from("rating")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    return data;
  }
}
