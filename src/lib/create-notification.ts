import formatDate from "@/lib/format-date";
import { TripParams } from "./create-trip";
import { supabase } from "./supabase";

/**
 * Handles a ride request or booking confirmation button press.
 * Creates new data entry for the notification table
 * which triggers Supabase webhook for sending notification.
 */
export default async function createNotification({
  userId,
  origin,
  destination,
  dateTime,
  notificationType,
  tripId,
}: TripParams & { notificationType: string; tripId: string }) {
  // return if an argument value is null
  if (
    !userId ||
    !origin ||
    !destination ||
    !dateTime ||
    !notificationType ||
    !tripId
  )
    return;

  const { formattedDate, formattedTime } = formatDate(dateTime);

  switch (notificationType) {
    case "ride_requested": {
      // retrieve drivers IDs and Expo push tokens
      const { data: recipients, error: recipientsError } = await supabase
        .from("profile")
        .select("id, expo_push_token")
        .contains("role", ["driver"])
        .not("expo_push_token", "is", null);

      if (recipientsError) throw recipientsError;

      // insert a new to the notification table
      for (const recipient of recipients) {
        const { error } = await supabase.from("notification").insert({
          user_id: userId,
          recipient_id: recipient.id,
          recipient_token: recipient.expo_push_token,
          title: "A new ride request",
          body: `From: ${origin.address}\nTo: ${destination.address}\nOn: ${formattedDate} at ${formattedTime}`,
          type: "ride_requested",
          trip_id: tripId,
        });

        if (error) throw error;
      }
    }

    default:
      return;
  }
}
