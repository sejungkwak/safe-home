import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";

import ScreenContainer from "@/components/ui/screenContainer";
import { supabase } from "@/lib/supabase";
import { signinData, signinSchema } from "@/schemas/signin";

function SigninScreen() {
  // Initialise React hook form
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
      <View>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                label="Email Address"
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={!!errors.email}
              />
              <HelperText type="error" visible={!!errors.email} padding="none">
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
              <TextInput
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
      <Button mode="contained" onPress={handleSubmit(onSubmit)}>
        Sign In
      </Button>

      <View style={styles.textContainer}>
        <Text variant="bodyLarge">Don&apos;t have an account?</Text>
        <Link href="/signup">
          <Text variant="bodyLarge">Sign up</Text>
        </Link>
      </View>
    </ScreenContainer>
  );
}

export default SigninScreen;

const styles = StyleSheet.create({
  textContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
  },
});
