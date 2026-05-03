import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, View } from "react-native";
import { HelperText, Text, useTheme } from "react-native-paper";

import GoogleSignIn from "@/components/auth/google-sign-in";
import HorizontalLine from "@/components/ui/horizontal-line";
import InputField from "@/components/ui/input-field";
import PrimaryButton from "@/components/ui/primary-button";
import ScreenContainer from "@/components/ui/screen-container";
import { supabase } from "@/lib/supabase";
import { signinData, signinSchema } from "@/schemas/sign-in";

/**
 * Renders the email/passowrd sign in form and the Google sign in button.
 * User input is validated with the Zod schema and Supabase Auth.
 */
function SigninScreen() {
  const { colors } = useTheme();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<signinData>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: signinData) {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      Alert.alert(error.message);
    }
  }

  return (
    <ScreenContainer>
      <ScrollView>
        <View className="flex items-center my-4">
          <Image
            source={require("./../assets/images/icons/icon.png")}
            style={{ width: 180, height: 100, borderRadius: 10 }}
          />
        </View>

        <View className="mb-4">
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
