import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Divider, Text, TextInput } from "react-native-paper";

import GoogleIcon from "@/components/ui/googleIcon";
import ScreenContainer from "@/components/ui/screenContainer";

function SignUpScreen() {
  return (
    <ScreenContainer>
      <View style={styles.formContainer}>
        <View>
          <TextInput label="Name" mode="outlined" />
          <TextInput
            label="Mobile Number"
            mode="outlined"
            keyboardType="phone-pad"
          />
          <TextInput
            label="Email Address"
            mode="outlined"
            keyboardType="email-address"
          />
          <TextInput label="Password" mode="outlined" secureTextEntry />
          <TextInput label="Confirm Password" mode="outlined" secureTextEntry />
        </View>
        <View style={styles.buttonContainer}>
          <Button mode="contained">Sign Up</Button>
          <Button mode="outlined">Sign Up as Driver</Button>
        </View>
      </View>
      <View style={styles.dividerContainer}>
        <Divider style={styles.divider} />
        <Text>or</Text>
        <Divider style={styles.divider} />
      </View>
      <Button mode="outlined" icon={() => <GoogleIcon size={20} />}>
        Sign in with Google
      </Button>

      <View style={styles.textContainer}>
        <Text variant="bodyLarge">Already have an account?</Text>
        <Link href="/">
          <Text variant="bodyLarge">Log in</Text>
        </Link>
      </View>
    </ScreenContainer>
  );
}

export default SignUpScreen;

const styles = StyleSheet.create({
  formContainer: {
    gap: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 16,
  },
  divider: {
    flex: 1,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
  },
});
