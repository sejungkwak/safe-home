import { supabase } from "../../lib/supabase";

/**
 * Retrieves profile data including vehicle details.
 *
 * @param userId The user id used to look up profiles
 * @returns An array containing the retrieved profile data
 */
export default async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profile")
    .select(`*, vehicle(*)`)
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}
