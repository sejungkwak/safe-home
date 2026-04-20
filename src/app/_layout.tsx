import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  useTheme,
} from "react-native-paper";

import { Colors } from "@/constants/theme";
import { SessionProvider, useSession } from "@/context/auth";
import { NotificationProvider } from "@/context/notification";
import { RoleProvider } from "@/context/role";
import { TripProvider } from "@/context/trip";
import { useRouterNotifications } from "@/hooks/use-router-notifications";
import "../../global.css";

// enable the notification to show the alert while the app is running.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true, // required for Android drop-down alert
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Sets up theme, notification routing,
 * and wraps the app with context providers.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();

  const paperTheme =
    colorScheme === "dark"
      ? { ...MD3DarkTheme, roundness: 2, colors: Colors.dark }
      : { ...MD3LightTheme, roundness: 2, colors: Colors.light };

  useRouterNotifications();

  return (
    <SessionProvider>
      <PaperProvider theme={paperTheme}>
        <RoleProvider>
          <TripProvider>
            <NotificationProvider>
              <RootStack />
            </NotificationProvider>
          </TripProvider>
        </RoleProvider>
      </PaperProvider>
    </SessionProvider>
  );
}

/**
 * Sets up the app navigation.
 * Shows the sign in and sign up screens to unauthorised users,
 * and tabs screens to authorised users.
 */
function RootStack() {
  const { user, initialised } = useSession();
  const { colors } = useTheme();

  return (
    <Stack>
      <Stack.Protected guard={!initialised || !user}>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "Sign In",
            headerShadowVisible: false,
            headerBackVisible: false,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.onBackground,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            headerTitle: "Sign Up",
            headerShadowVisible: false,
            headerBackVisible: false,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.onBackground,
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!!initialised && !!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="booking"
          options={{
            headerTitle: "Pickup Time",
            headerShadowVisible: false,
            headerBackVisible: true,
            headerBackButtonDisplayMode: "minimal",
          }}
        />
        <Stack.Screen
          name="trip-details"
          options={{
            headerTitle: "",
            headerShadowVisible: false,
            headerBackVisible: true,
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
