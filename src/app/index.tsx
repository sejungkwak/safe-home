import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

import ScreenContainer from "@/components/ui/screen-container";

export default function Index() {
  const router = useRouter();
  return (
    <ScreenContainer>
      <View style={styles.logoContainer}>
        <Text>Safe Home</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          mode="contained"
          onPress={() => router.push("/sign-up")}
        >
          Sign up
        </Button>
        <Button
          style={styles.button}
          mode="outlined"
          onPress={() => router.push("/sign-in")}
        >
          Sign in
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
  },
});
