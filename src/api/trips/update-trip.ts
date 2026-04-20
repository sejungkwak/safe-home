import { supabase } from "../../lib/supabase";

/**
 * Updates the status column in the trip table.
 * The update scenarios include ride request confirmation, ride request acceptance,
 * ride progress status changes (in progress and completed), and ride cancellation.
 *
 * @param id The trip id
 * @param statusType The trip status to update to
 * @returns The trip data object
 */
export default async function updateTrip(
  id: string,
  statusType: string,
  driverId?: string,
) {
  if (driverId) {
    // add driver_id when a driver accepts a ride request
    const { data, error } = await supabase
      .from("trip")
      .update({
        driver_id: driverId,
        status: statusType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    return data;
  } else {
    const { data, error } = await supabase
      .from("trip")
      .update({ status: statusType, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) throw error;

    return data;
  }
}
