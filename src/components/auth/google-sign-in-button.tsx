import { View } from "react-native";
import { Text } from "react-native-paper";

import PrimaryButton from "../ui/primary-button";
import GoogleIcon from "./google-icon";

export default function GoogleSignInButton({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <PrimaryButton mode="outlined" onPress={onPress}>
      <View className="flex-1 flex-row gap-2 content-center items-center">
        <GoogleIcon size={18} />
        <Text>Sign in with Google</Text>
      </View>
    </PrimaryButton>
  );
}
