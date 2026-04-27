import { useState } from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Rating } from "react-native-ratings";
import PrimaryButton from "./primary-button";

/**
 * A custom rating component utilising react-native-ratings.
 * Displays a title with the rider or driver name and rating.
 *
 * @param name The rider or driver name receiving the rating
 * @param onFinish A callback function that passes the rating to the parent component
 */
export default function Ratings({
  name,
  readOnly,
  savedRating,
  onFinish,
}: {
  name: string;
  readOnly: boolean;
  savedRating?: number;
  onFinish?: (rating: number) => void;
}) {
  const theme = useTheme();
  const [rating, setRating] = useState<number>(savedRating ?? 5);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(readOnly);

  function onPress() {
    if (!onFinish) return;
    onFinish(rating);
    setIsReadOnly(true);
  }

  return (
    <View
      className="border rounded-xl mx-2 py-3 gap-2"
      style={{
        borderColor: theme.colors.outline,
        backgroundColor: theme.colors.surface,
      }}
    >
      {!isReadOnly && (
        <>
          <Text variant="titleSmall" style={{ textAlign: "center" }}>
            How was your trip with {name}?
          </Text>
          <Text variant="titleSmall" style={{ textAlign: "center" }}>
            {rating}/5
          </Text>
        </>
      )}
      {isReadOnly && (
        <Text variant="titleSmall" style={{ textAlign: "center" }}>
          You have given {name} {savedRating} stars.
        </Text>
      )}
      <Rating
        readonly={isReadOnly}
        startingValue={rating}
        tintColor={theme.colors.surface}
        onFinishRating={(newRating: number) => {
          if (!isReadOnly) setRating(newRating);
        }}
      />
      {!isReadOnly && <PrimaryButton onPress={onPress}>Submit</PrimaryButton>}
    </View>
  );
}
