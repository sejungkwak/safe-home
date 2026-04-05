import { supabase } from "@/lib/supabase";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { View } from "react-native";
import { HelperText } from "react-native-paper";
import GoogleSignInButton from "./google-sign-in-button";

/**
 * Handles Google authentication using Supabase Auth and the
 * @react-native-google-signin/google-signin package.
 */
export default function GoogleSignIn() {
  const [error, setError] = useState<string | null>(null);

  /**
   * Initiates the sign in flow when the button is pressed.
   */
  async function handlePress() {
    // configure the Google OAuth Client IDs for Web (used for Android) and iOS
    GoogleSignin.configure({
      webClientId:
        process.env.EXPO_PUBLIC_SUPABASE_AUTH_EXTERNAL_GOOGLE_WEB_CLIENT_ID,
      iosClientId:
        process.env.EXPO_PUBLIC_SUPABASE_AUTH_EXTERNAL_GOOGLE_IOS_CLIENT_ID,
    });
    try {
      // check if Google Play Services is available for Android
      await GoogleSignin.hasPlayServices();

      // trigger the Google sign in prompt
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        if (response.data.idToken) {
          // Supabase verifies the ID token against Google's public key
          // if successful, user data (name, email, avatar/photo) is stored in the database.
          const { error: supabaseError } =
            await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.data.idToken,
            });
          if (supabaseError) throw supabaseError;
        } else {
          throw new Error("No ID Token present.");
        }
      }
    } catch (error: any) {
      if (isErrorWithCode(error) && error.code !== undefined) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // user cancelled the sign in flow
            break;
          case statusCodes.IN_PROGRESS:
            // operation (e.g. sign in) is in progress already
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // play services not available or outdated
            setError("Google Play Services is not available or outdated.");
            break;
          default:
            // some other error happened
            setError("Sign in failed.");
            break;
        }
      } else {
        // non-SDK-related errors
        setError(error?.message ?? "Something went wrong.");
      }
    }
  }

  return (
    <View>
      <GoogleSignInButton onPress={handlePress} />
      {error && (
        <HelperText type={"error"} visible={!!error} padding="none">
          {error}
        </HelperText>
      )}
    </View>
  );
}
