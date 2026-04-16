import { Pressable, View } from "react-native";
import { Card, Icon, Text } from "react-native-paper";

export default function TripCard(props: { [key: string]: any }) {
  return (
    // TODO add details screen and redirect to there
    <Pressable onPress={() => {}}>
      <Card mode="outlined" style={{ margin: 12 }}>
        <Card.Content>
          <View className="flex-row gap-4">
            <View className="items-center justify-center">
              {props.pickupTiming && <Text>{props.pickupTiming}</Text>}
              {props.icon && <Icon source="car" size={24}></Icon>}
            </View>

            <View className="flex-1 gap-2">
              <Text variant="labelMedium">{props.pickupTime}</Text>
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
    </Pressable>
  );
}
