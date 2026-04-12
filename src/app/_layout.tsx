import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";

import { Colors } from "@/constants/theme";
import { SessionProvider, useSession } from "@/context/auth";
import { TripProvider } from "@/context/trip";
import "../../global.css";

export default function RootLayout() {
  return (
    <SessionProvider>
      <InitialLayout />
    </SessionProvider>
  );
}

// https://supabase.com/blog/react-native-storage
function InitialLayout() {
  const { session, initialised } = useSession();
  const segments = useSegments();
  const router = useRouter();

  const colorScheme = useColorScheme();

  const paperTheme =
    colorScheme === "dark"
      ? { ...MD3DarkTheme, roundness: 2, colors: Colors.dark }
      : { ...MD3LightTheme, roundness: 2, colors: Colors.light };

  useEffect(() => {
    if (!initialised) return;

    // check if the path/url is in the (tabs) group
    const inTabsGroup = segments[0] === "(tabs)";

    if (session && !inTabsGroup) {
      // redirect authenticated users to the home screen
      router.replace("/(tabs)/home");
    } else if (!session) {
      // redirect unauthenticated users to the sign in screen
      router.replace("/");
    }
  }, [session, initialised]);

  return (
    <PaperProvider theme={paperTheme}>
      <TripProvider>
        <RootStack />
      </TripProvider>
    </PaperProvider>
  );
}

function RootStack() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Sign In",
          headerShadowVisible: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          headerTitle: "Sign Up",
          headerShadowVisible: false,
          headerBackVisible: false,
        }}
      />
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
    </Stack>
  );
}
