import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text>Safe Home</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button style={styles.button} mode="contained">
          Sign up
        </Button>
        <Button style={styles.button} mode="outlined">
          Log in
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
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
