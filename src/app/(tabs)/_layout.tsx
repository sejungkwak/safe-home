import { Redirect, Stack } from "expo-router";

import { useSession } from "@/ctx";

export default function AppLayout() {
  const { session } = useSession();

  if (!session) {
    return <Redirect href="/" />;
  }

  return (
    <Stack>
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
    </Stack>
  );
}
