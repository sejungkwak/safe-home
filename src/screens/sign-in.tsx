import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, View } from "react-native";
import { HelperText, RadioButton, Text, useTheme } from "react-native-paper";

import GoogleSignIn from "@/components/auth/google-sign-in";
import HorizontalLine from "@/components/ui/horizontal-line";
import InputField from "@/components/ui/input-field";
import PrimaryButton from "@/components/ui/primary-button";
import ScreenContainer from "@/components/ui/screen-container";
import { useRole } from "@/context/role";
import { supabase } from "@/lib/supabase";
import { signinData, signinSchema } from "@/schemas/sign-in";

/**
 * Renders the email/passowrd sign in form and the Google sign in button.
 * User input is validated with the Zod schema and Supabase Auth.
 */
function SigninScreen() {
  const { colors } = useTheme();
  const { setRole } = useRole();
  const [userType, setUserType] = useState("rider");

  // initialise React Hook Form with Zod schema validation
  const {
    handleSubmit,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<signinData>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  // clear error messages on user type changes.
  useEffect(() => {
    clearErrors();
  }, [userType, clearErrors]);

  /**
   * Submits the user input data after validation has passed.
   */
  async function onSubmit(values: signinData) {
    // retrieve the user role from database for the entered email
    const { data: userProfile, error: userTypeError } = await supabase
      .from("profile")
      .select("role, email")
      .eq("email", values.email)
      .contains("role", [userType])
      .single();

    if (!userProfile || userTypeError) {
      Alert.alert(
        "Invalid login credentials",
        "The information you entered does not match our records.",
      );
      await supabase.auth.signOut();
      return;
    }

    // pass the validated email and password to Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    // display the error message if authentication fails
    if (error) {
      Alert.alert(error.message);
      return;
    }

    // store userType in React context
    setRole(userType);
  }

  return (
    <ScreenContainer>
      <ScrollView>
        <View className="mb-4">
          <RadioButton.Group
            onValueChange={(value) => setUserType(value)}
            value={userType}
          >
            <View className="flex-row">
              <RadioButton.Item
                label="Rider"
                value="rider"
                mode="android"
                position="leading"
              />
              <RadioButton.Item
                label="Driver"
                value="driver"
                mode="android"
                position="leading"
              />
            </View>
          </RadioButton.Group>
          <View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <InputField
                    label="Email Address"
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={!!errors.email}
                  />
                  <HelperText
                    type="error"
                    visible={!!errors.email}
                    padding="none"
                  >
                    {errors.email?.message}
                  </HelperText>
                </View>
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <InputField
                    label="Password"
                    mode="outlined"
                    autoCapitalize="none"
                    secureTextEntry
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={!!errors.password}
                  />
                  <HelperText
                    type="error"
                    visible={!!errors.password}
                    padding="none"
                  >
                    {errors.password?.message}
                  </HelperText>
                </View>
              )}
            />
          </View>
          <PrimaryButton onPress={handleSubmit(onSubmit)}>
            Sign In
          </PrimaryButton>
        </View>

        <View className="flex-row items-center gap-2 my-4">
          <HorizontalLine />
          <Text>or</Text>
          <HorizontalLine />
        </View>
        <GoogleSignIn />

        <View className="flex-row justify-center gap-2 mt-8">
          <Text variant="bodyLarge">Don&apos;t have an account?</Text>
          <Link href="/sign-up">
            <Text
              variant="bodyLarge"
              theme={{ colors: { onSurface: colors.primary } }}
            >
              Sign up
            </Text>
          </Link>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export default SigninScreen;
