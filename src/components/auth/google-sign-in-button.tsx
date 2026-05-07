import { View } from "react-native";
import { Text } from "react-native-paper";

import GoogleIcon from "@/components/auth/google-icon";
import PrimaryButton from "@/components/ui/primary-button";

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
