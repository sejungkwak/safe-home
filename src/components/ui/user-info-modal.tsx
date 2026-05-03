import { Image } from "expo-image";
import { Linking, Pressable, View } from "react-native";
import {
  Button,
  Icon,
  Modal,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";

type Props = {
  visible: boolean;
  name: string | null;
  phone: string | null;
  profilePhotoUrl: string | null;
  averageRating: number | null;
  onDismiss: () => void;
};

/**
 * Renders a modal with a user profile photo,
 * name, phone number, and average rating.
 */
export default function UserInfoModal({
  visible,
  onDismiss,
  name,
  phone,
  profilePhotoUrl,
  averageRating,
}: Props) {
  const { colors } = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: colors.background,
          padding: 20,
          width: "90%",
          borderRadius: 10,
          alignSelf: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        {profilePhotoUrl && (
          <Image
            source={{ uri: profilePhotoUrl }}
            style={{ width: 80, height: 80, borderRadius: 40 }}
          />
        )}
        <Text variant="headlineSmall">{name ?? "Unknown"}</Text>
        {phone && (
          <Pressable
            className="flex-row items-center gap-2"
            onPress={() => Linking.openURL(`tel:${phone}`)}
          >
            <Icon source="phone-outline" size={20} color={colors.primary} />
            <Text variant="bodyMedium" style={{ color: colors.primary }}>
              {phone}
            </Text>
          </Pressable>
        )}
        <View className="flex-row items-center gap-2">
          <Icon source="star-outline" size={20} color={colors.onSurface} />
          <Text variant="bodyMedium">
            {averageRating !== null
              ? `${averageRating.toFixed(1)} / 5`
              : "No ratings"}
          </Text>
        </View>
        <Button mode="contained" onPress={onDismiss} style={{ width: "100%" }}>
          Close
        </Button>
      </Modal>
    </Portal>
  );
}
