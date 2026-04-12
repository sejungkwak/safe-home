import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Prepares the notification channel for Android.
 * Prompts the user for notification permissions.
 * @returns Expo push token
 */
export async function registerForPushNotificationsAsync() {
  // Code is modified based on the following resources:
  // https://docs.expo.dev/versions/v54.0.0/sdk/notifications/#usage
  // https://github.com/betomoedano/expo-notifications-app/blob/main/utils/registerForPushNotificationsAsync.ts
  let token;

  // a real physical device is needed  push to receive push notifications
  if (!Device.isDevice) {
    throw new Error("Must use physical device for Push Notifications");
  }

  // prepare the notification channel for Android
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "A default notification",
      // relative priority for the notifications.
      // set to a higher-priority, as low-priority notifications may be hidden.
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  // check the current notification permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // request notification permissions
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  // throw an error if permissions are still not granted
  if (finalStatus !== "granted") {
    throw new Error("Failed to get push token for push notification");
  }

  try {
    // retrieve the EAS project ID
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }

    // retrieve the EXPO push token for the device and project
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
  } catch (error) {
    throw error;
  }

  return token;
}
