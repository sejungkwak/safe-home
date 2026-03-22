import React, { useState } from "react";
import { BottomNavigation } from "react-native-paper";

import HomeScreen from "./home";
import ProfileScreen from "./profile";
import TripsScreen from "./trips";

// https://oss.callstack.com/react-native-paper/docs/components/BottomNavigation/

export default function TabLayout() {
  const [index, setIndex] = useState(0);

  const [routes] = useState([
    {
      key: "home",
      title: "Home",
      focusedIcon: "home",
      unfocusedIcon: "home-outline",
    },
    {
      key: "trips",
      title: "Trips",
      focusedIcon: "list-box",
      unfocusedIcon: "list-box-outline",
    },
    {
      key: "profile",
      title: "Profile",
      focusedIcon: "account-circle",
      unfocusedIcon: "account-circle-outline",
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    trips: TripsScreen,
    profile: ProfileScreen,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}
