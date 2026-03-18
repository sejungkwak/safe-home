import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, View } from "react-native";
import PhoneInput, {
  ICountry,
  isValidPhoneNumber,
} from "react-native-international-phone-number";
import {
  Button,
  Divider,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import { supabase } from "../lib/supabase";

import GoogleIcon from "@/components/ui/googleIcon";
import ScreenContainer from "@/components/ui/screenContainer";
import { signupData, signupSchema } from "@/schemas/signup";

function SignUpScreen() {
  // Initialise React hook form with Zod validation
  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<signupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [selectedCountry, setSelectedCountry] = useState<undefined | ICountry>(
    undefined,
  );

  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }

  async function onSubmit(values: signupData) {
    // Validate phone number input
    const phoneNumber = `${selectedCountry?.idd?.root} ${values.phone}`;
    const isValid = isValidPhoneNumber(
      values.phone,
      selectedCountry as ICountry,
    );
    if (!isValid) {
      setError("phone", {
        message: "Invalid mobile number.",
      });
      return;
    }

    // Register a new user with Supabase auth
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: "safehome://",
        data: {
          name: values.name,
          phone: phoneNumber,
        },
      },
    });
    if (error) {
      Alert.alert(error.message);
      return;
    }
    if (!session) {
      Alert.alert("Please check your inbox for email verification!");
      reset();
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.formContainer}>
        <View>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  label="Name"
                  mode="outlined"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={!!errors.name}
                />
                <HelperText type="error" visible={!!errors.name} padding="none">
                  {errors.name?.message}
                </HelperText>
              </View>
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <View>
                <PhoneInput
                  defaultCountry="IE"
                  value={value}
                  onChangePhoneNumber={onChange}
                  selectedCountry={selectedCountry}
                  onChangeSelectedCountry={handleSelectedCountry}
                />
                <HelperText
                  type="error"
                  visible={!!errors.phone}
                  padding="none"
                >
                  {errors.phone?.message}
                </HelperText>
              </View>
            )}
          />
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
            control={control}
            name="password"
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
                  type="info"
                  visible={!errors.password}
                  padding="none"
                  style={[
                    !errors.password ? styles.expanded : styles.collapsed,
                  ]}
                >
                  Password must be at least 6 characters.
                </HelperText>
                <HelperText
                  type="error"
                  visible={!!errors.password}
                  padding="none"
                  style={[
                    !!errors.password ? styles.expanded : styles.collapsed,
                  ]}
                >
                  {errors.password?.message}
                </HelperText>
              </View>
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  label="Confirm Password"
                  mode="outlined"
                  autoCapitalize="none"
                  secureTextEntry
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={!!errors.confirmPassword}
                />
                <HelperText
                  type="error"
                  visible={!!errors.confirmPassword}
                  padding="none"
                >
                  {errors.confirmPassword?.message}
                </HelperText>
              </View>
            )}
          />
        </View>
        <Button mode="contained" onPress={handleSubmit(onSubmit)}>
          Sign Up
        </Button>
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
        <Link href="/signin">
          <Text variant="bodyLarge">Sign in</Text>
        </Link>
      </View>
    </ScreenContainer>
  );
}

export default SignUpScreen;

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: 16,
  },
  expanded: {
    display: "flex",
  },
  collapsed: {
    display: "none",
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
