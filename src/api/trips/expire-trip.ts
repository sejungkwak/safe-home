import { supabase } from "@/lib/supabase";

/**
 * Updates the status to "expired" if a pending trip's
 * "start_time" is more than an hour ago.
 */
export default async function expireTrip() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const oneHourAgoISO = new Date(oneHourAgo).toISOString();

  const { error } = await supabase
    .from("trip")
    .update({ status: "expired" })
    .match({ status: "pending" })
    .lt("start_time", oneHourAgoISO);

  if (error) throw error;
}
