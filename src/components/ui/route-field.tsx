import * as React from "react";
import { ScrollView, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

export default function RouteField({
  origin,
  destination,
}: {
  origin: string | null;
  destination: string | null;
}) {
  const theme = useTheme();

  return (
    <View className="mx-2">
      <View
        className="flex-row items-center h-14 border rounded-t-xl rounded-b-none px-3 gap-2"
        style={{
          borderColor: theme.colors.outline,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Icon
          source="circle-slice-8"
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: "center", flexGrow: 1 }}
          style={{ flex: 1 }}
        >
          <Text style={{ color: theme.colors.onSurface }}>{origin}</Text>
        </ScrollView>
      </View>

      <View
        className="flex-row items-center h-14 border rounded-t-none rounded-b-xl px-3 gap-2"
        style={{
          borderColor: theme.colors.outline,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Icon
          source="map-marker-outline"
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: "center", flexGrow: 1 }}
          style={{ flex: 1 }}
        >
          <Text style={{ color: theme.colors.onSurface }}>
            {destination?.replace(/, Ireland$/, "")}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}
