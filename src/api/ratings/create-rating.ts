import { supabase } from "../../lib/supabase";

/**
 * Handles a rating submission.
 * Creates a new data entry in the rating table.
 *
 * @param userId The user id receiving the rating
 * @param tripId The trip id associated with the rating
 * @param rating the rating value from 0 to 5
 */
export default async function createRating(
  tripId: string | null,
  userId: string | null,
  rating: number | null,
) {
  if (!userId || !tripId || rating === null) return;

  // insert a new entry to the trip table
  const { error } = await supabase
    .from("rating")
    .insert({
      user_id: userId,
      trip_id: tripId,
      rating: rating,
    })
    .select();

  if (error) throw error;
}
