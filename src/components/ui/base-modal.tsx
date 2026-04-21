import { Href, useRouter } from "expo-router";
import { Button, Modal, Portal, Text, useTheme } from "react-native-paper";

/**
 * A custom modal component using React Native Paper, consisting of
 * a title, body text, and a button. When the button is pressed, the user
 * is navigated to the specified screen.
 *
 * @param title The heading text
 * @param body The message
 * @param screen The route to navigate to when "OK" is pressed
 * @param onConfirm A callback function when "OK" is pressed
 */
export default function BaseModal({
  title,
  body,
  screen,
  onConfirm,
}: {
  title: string;
  body: string;
  screen: Href;
  onConfirm?: () => void;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <Portal>
      <Modal
        visible={true}
        dismissable={false}
        contentContainerStyle={{
          backgroundColor: colors.background,
          padding: 20,
          width: "90%",
          borderRadius: 10,
          alignSelf: "center",
        }}
      >
        <Text variant="headlineSmall" style={{ textAlign: "center" }}>
          {title}
        </Text>
        <Text
          variant="bodyMedium"
          style={{ marginTop: 10, marginBottom: 16, textAlign: "center" }}
        >
          {body}
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            onConfirm?.();
            router.replace(screen);
          }}
        >
          OK
        </Button>
      </Modal>
    </Portal>
  );
}
