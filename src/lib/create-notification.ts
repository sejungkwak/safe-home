import DateFormatter from "@/components/home/date-formatter";
import { TripParams } from "./create-trip";
import { supabase } from "./supabase";

/**
 * Handles a ride request or booking confirmation button press.
 * Creates new data entry for the notification table
 * which triggers Supabase webhook for sending notification.
 */
export default async function createNotification({userId, origin, destination, dateTime, notificationType, tripId}: TripParams & {notificationType: string, tripId: string}) {
    
    if (!userId || !origin || !destination || !dateTime || !notificationType || !tripId) return;

    const {formattedDate, formattedTime} = DateFormatter(dateTime);

    // insert a new entry to the notification table
    if (notificationType === "ride_requested") {

        const {error} = await supabase.from("notification").insert({
            user_id: userId,
            title: "A new ride request",
            body: `From: ${origin.address}\nTo: ${destination.address}\nOn: ${formattedDate} at ${formattedTime}`,
            type: "ride_requested",
            trip_id: tripId,
        })

        if (error) throw error;
    }
}