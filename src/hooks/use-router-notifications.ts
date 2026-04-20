import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React from "react";

// This hook is modified based on
// https://medium.com/@rohandhalpe05/wake-up-your-app-everything-about-mobile-push-notifications-in-expo-react-native-100144faf7b6

type NotificationType =
  | "ride_requested"
  | "driver_accepted"
  | "rider_accepted"
  | "driver_cancelled"
  | "rider_cancelled";

type NotificationData = {
  type: NotificationType;
  trip_id?: string;
};

/**
 * Redirects the user to a screen based on the notification type.
 * @param notifData The notification type from the notification data
 * @param router The expo-router Router object
 */
function onNotificationRedirect(
  notifData: NotificationData,
  router: ReturnType<typeof useRouter>,
) {
  switch (notifData.type) {
    // redirect the driver to the home screen with request lists
    case "ride_requested":
      router.push("/");
      break;

    case "driver_accepted":
      // redirect the rider to the home screen with driver details
      router.push({
        pathname: "/trip-details",
        params: {
          id: notifData.trip_id,
        },
      });
      break;

    case "rider_accepted":
      // TODO redirect the driver to the home screen with the map!
      router.push({
        pathname: "/",
        params: {
          tripId: notifData.trip_id,
        },
      });
      break;

    case "driver_cancelled":
      // TODO redirect the rider to the home screen
      router.push({
        pathname: "/",
        params: {
          tripId: notifData.trip_id,
        },
      });
      break;

    case "rider_cancelled":
      // TODO redirect the driver to the home screen
      router.push({
        pathname: "/",
        params: {
          tripId: notifData.trip_id,
        },
      });
      break;

    default:
      break;
  }
}

/**
 * Handles navigation when the user taps a push notification.
 */
export function useRouterNotifications() {
  const router = useRouter();

  React.useEffect(() => {
    let isMounted = true;

    // get the notification response received most recently and redirect
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response) return;
      const notifData = response.notification.request.content
        .data as NotificationData;
      if (!notifData) return;
      onNotificationRedirect(notifData, router);
    });

    // listen for notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (!response) return;

        const notifData = response.notification.request.content
          .data as NotificationData;
        if (!notifData) return;
        onNotificationRedirect(notifData, router);
      },
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [router]);
}
