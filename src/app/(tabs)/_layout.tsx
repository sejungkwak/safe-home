import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <NativeTabs>
        <NativeTabs.Trigger name="home">
          <Label>Home</Label>
          <Icon
            sf={{ default: "house", selected: "house.fill" }}
            drawable="ic_menu_home"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="trips">
          <Label>Trips</Label>
          <Icon
            sf={{ default: "car", selected: "car.fill" }}
            drawable="ic_menu_paste_holo_dark"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="account">
          <Label>Account</Label>
          <Icon
            sf={{ default: "person.circle", selected: "person.circle.fill" }}
            drawable="perm_group_personal_info"
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
