import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";

import { SessionProvider, useSession } from "@/ctx";

export default function RootLayout() {
  return (
    <SessionProvider>
      <PaperProvider>
        <RootStack />
      </PaperProvider>
    </SessionProvider>
  );
}

function RootStack() {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/(tabs)/profile");
    }
  }, [session, router]);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Sign In", headerBackVisible: false }}
      />
      <Stack.Screen
        name="sign-up"
        options={{ title: "Sign Up", headerBackVisible: false }}
      />
      {/* <Stack.Screen
        name="sign-in"
        options={{ title: "Sign In", headerBackVisible: false }}
      /> */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
