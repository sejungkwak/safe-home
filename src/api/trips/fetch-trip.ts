import { supabase } from "@/lib/supabase";

/**
 * Retrieves trip data based on the passed column and value.
 *
 * @param column The column to filter on
 * @param value The value to filter with
 * @param ascending The order of the query result by start_time
 * @returns An array containing the retrieved trip data
 */
export default async function fetchTrip(
  column: string,
  value: string,
  ascending: boolean,
) {
  const { data, error } = await supabase
    .from("trip")
    .select("*")
    .eq(column, value)
    .order("start_time", { ascending: ascending });

  if (error) throw error;

  return data;
}
