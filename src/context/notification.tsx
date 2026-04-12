import * as Notifications from "expo-notifications";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import { useSession } from "@/context/auth";
import { registerForPushNotificationsAsync } from "@/lib/register-for-push-notifications";
import { supabase } from "@/lib/supabase";

// This React context code is modified based on
// https://github.com/betomoedano/expo-notifications-app/blob/main/context/NotificationContext.tsx

// define notification context type
type NotificationContextType = {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
};

// create context object
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

/**
 * Custom hook for reading the notification context.
 */
export function useNotification() {
  const value = useContext(NotificationContext);
  if (!value) {
    throw new Error(
      "useNotification must be wrapped in a <NotificationProvider />",
    );
  }
  return value;
}

/**
 * Broadcasts the notification context to all components.
 * Manages token registration, notification states, and listeners.
 */
export function NotificationProvider({ children }: PropsWithChildren) {
  const { user } = useSession();

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // listen to foreground notification events
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Notification Received: ", notification);
        setNotification(notification);
      },
    );

    // listen to user interactions
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // TODO redirect user to the appropriate screen
        console.log("🔔 Notification Response: ", response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // retrieve the Expo push token, set expoPushToken,
    // and update database on sign in
    registerForPushNotificationsAsync().then(
      async (token) => {
        setExpoPushToken(token);
        const { error } = await supabase
          .from("profile")
          .update({ expo_push_token: token })
          .eq("id", user.id);
        if (error) throw error;
      },
      (error) => {
        console.error(error);
        setError(error);
      },
    );
  }, [user?.id]);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
