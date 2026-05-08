import { supabase } from "@/lib/supabase";

/**
 * Updates the status to "expired" if a pending or accepted
 * trip's "start_time" is more than an hour ago.
 */
export default async function expireTrip() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const oneHourAgoISO = new Date(oneHourAgo).toISOString();

  const { data, error } = await supabase
    .from("trip")
    .update({ status: "expired" })
    .or("status.eq.pending,status.eq.driver_accepted,status.eq.rider_accepted")
    .lt("start_time", oneHourAgoISO)
    .select();

  if (error) throw error;

  return data;
}
