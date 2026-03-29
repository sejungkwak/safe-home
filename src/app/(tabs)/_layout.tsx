import React, { useState } from "react";
import { BottomNavigation } from "react-native-paper";

import AccountScreen from "./account";
import HomeScreen from "./home";
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
      key: "account",
      title: "Account",
      focusedIcon: "account-circle",
      unfocusedIcon: "account-circle-outline",
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    trips: TripsScreen,
    account: AccountScreen,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}
