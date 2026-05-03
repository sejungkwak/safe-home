import { supabase } from "../../lib/supabase";

/**
 * Handles driver verification status changes triggered by admin.
 * Creates new data entry for the verif_notification table
 * which triggers Supabase webhook for sending notification.
 */
export default async function createVerifNotification({
  driverId,
  pushToken,
  notificationType,
  reason,
}: {
  driverId: string;
  pushToken: string;
  notificationType: string;
  reason?: string;
}) {
  // return if an argument value is null
  if (!notificationType) return;

  switch (notificationType) {
    case "rejected": {
      const { error } = await supabase.from("verif_notification").insert({
        driver_id: driverId,
        driver_token: pushToken,
        title: "Driver verification failed",
        body: `Your verification was not approved: ${reason}\nPlease resubmit a new licence photo.`,
        type: "rejected",
      });

      if (error) throw error;

      break;
    }

    case "verified": {
      const { error } = await supabase.from("verif_notification").insert({
        driver_id: driverId,
        driver_token: pushToken,
        title: "Driver verification approved",
        body: "Your driver verification was successful. You can now accept requests.",
        type: "verified",
      });

      if (error) throw error;

      break;
    }

    default:
      return;
  }
}
