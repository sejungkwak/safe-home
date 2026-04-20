import formatDate from "@/lib/format-date";
import { supabase } from "../../lib/supabase";
import { TripParams } from "../trips/create-trip";

/**
 * Handles a ride request or booking confirmation button press.
 * Creates new data entry for the notification table
 * which triggers Supabase webhook for sending notification.
 */
export default async function createNotification({
  riderId,
  driverId,
  pushToken,
  origin,
  destination,
  dateTime,
  notificationType,
  tripId,
}: TripParams & {
  driverId?: string;
  pushToken?: string;
  notificationType: string;
  tripId: string;
}) {
  // return if an argument value is null
  if (
    !riderId ||
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
          user_id: riderId,
          recipient_id: recipient.id,
          recipient_token: recipient.expo_push_token,
          title: "A new ride request",
          body: `From: ${origin.address}\nTo: ${destination.address}\nOn: ${formattedDate} at ${formattedTime}`,
          type: "ride_requested",
          trip_id: tripId,
        });

        if (error) throw error;
      }
      break;
    }

    case "driver_accepted": {
      const { error } = await supabase.from("notification").insert({
        user_id: driverId,
        recipient_id: riderId,
        recipient_token: pushToken,
        title: "Request accepted",
        body: "Please confirm your trip to finalise.",
        type: "driver_accepted",
        trip_id: tripId,
      });

      if (error) throw error;

      break;
    }

    case "rider_cancelled": {
      const { error } = await supabase.from("notification").insert({
        user_id: riderId,
        recipient_id: driverId,
        recipient_token: pushToken,
        title: "Trip cancelled",
        body: `Your rider cancelled the trip:\nFrom: ${origin.address}\nTo: ${destination.address}\nOn: ${formattedDate} at ${formattedTime}`,
        type: "rider_cancelled",
        trip_id: tripId,
      });

      if (error) throw error;

      break;
    }

    case "rider_accepted": {
      const { error } = await supabase.from("notification").insert({
        user_id: riderId,
        recipient_id: driverId,
        recipient_token: pushToken,
        title: "Trip confirmed",
        body: `Your rider confirmed the trip with you for ${formattedDate} at ${formattedTime}`,
        type: "rider_accepted",
        trip_id: tripId,
      });

      if (error) throw error;

      break;
    }

    default:
      return;
  }
}
