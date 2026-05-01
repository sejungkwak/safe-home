import Ionicons from "@expo/vector-icons/Ionicons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { IconButton, useTheme } from "react-native-paper";

import { useSession } from "@/context/auth";
import { useRole } from "@/context/role";

export default function TabLayout() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const { signOut } = useSession();
  const { role } = useRole();

  const isAdmin = role === "admin";

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title:
              role === "driver"
                ? "Ride Requests"
                : "Pending Driver Verification",
            headerShown: role !== "rider",
            headerShadowVisible: false,
            headerRight: isAdmin
              ? () => <IconButton icon="logout" size={20} onPress={signOut} />
              : undefined,
            tabBarLabel: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
            href: isAdmin ? null : "/home",
          }}
        />
        <Tabs.Protected guard={!isAdmin}>
          <Tabs.Screen
            name="trips"
            options={{
              title: "Trips",
              headerShown: true,
              headerShadowVisible: false,
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "car" : "car-outline"}
                  size={24}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="account"
            options={{
              title: "Account",
              headerShown: true,
              headerShadowVisible: false,
              headerRight: () => (
                <IconButton icon="logout" size={20} onPress={signOut} />
              ),
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "person-circle" : "person-circle-outline"}
                  size={24}
                  color={color}
                />
              ),
            }}
          />
        </Tabs.Protected>
      </Tabs>
    </ThemeProvider>
  );
}
