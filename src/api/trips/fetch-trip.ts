import { supabase } from "../../lib/supabase";

/**
 * Retrieves trip data based on the user role.
 *
 * @param id The signed-in user id
 * @param role The user role, rider or driver
 * @returns An array containing the retrieved trip data
 */
export default async function fetchTrip(id: string, role: string) {
  if (role === "rider") {
    const { data, error } = await supabase
      .from("trip")
      .select("*")
      .eq("rider_id", id)
      .order("start_time", { ascending: false });

    if (error) throw error;

    return data;
  } else {
    const { data, error } = await supabase
      .from("trip")
      .select("*")
      .eq("driver_id", id)
      .order("start_time", { ascending: false });

    if (error) throw error;

    return data;
  }
}
