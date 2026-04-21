import { View } from "react-native";
import { Card, Icon, Text } from "react-native-paper";

/**
 * A custom card component utilising React Native Paper Card.
 * Displays an icon or pickup timing text ("ASAP" or "Later") on the left side
 * and trip details on the right side.
 */
export default function TripCard(props: { [key: string]: any }) {
  return (
    <Card mode="outlined" style={{ margin: 12 }}>
      <Card.Content>
        <View className="flex-row gap-4">
          <View className="items-center justify-center">
            {props.pickupTiming && <Text>{props.pickupTiming}</Text>}
            {props.icon && <Icon source={props.icon} size={24}></Icon>}
          </View>

          <View className="flex-1 gap-2">
            <View className="flex-1 flex-row gap-4">
              <Text variant="labelMedium">{props.pickupTime}</Text>
              <Text variant="labelMedium">{props.options}</Text>
            </View>
            <Text variant="bodyMedium" numberOfLines={1} ellipsizeMode="tail">
              From: {props.origin}
            </Text>
            <Text variant="bodyMedium" numberOfLines={1} ellipsizeMode="tail">
              To: {props.destination}
            </Text>
            <Text variant="bodySmall">€{props.fare}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}
