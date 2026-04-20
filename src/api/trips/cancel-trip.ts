import { supabase } from "../../lib/supabase";

/**
 * Updates the status column in the trip table based on who cancelled it.
 *
 * @param id The trip id
 * @param canceller The role of the person cancelling, rider or driver
 * @returns The trip data object
 */
export default async function cancelTrip(id: string, canceller: string) {
  const status = canceller === "rider" ? "rider_cancelled" : "driver_cancelled";

  const { data, error } = await supabase
    .from("trip")
    .update({ status: status })
    .eq("id", id)
    .select();

  if (error) throw error;

  return data;
}
