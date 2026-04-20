import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, useColorScheme, View } from "react-native";
import PhoneInput, {
  ICountry,
  isValidPhoneNumber,
} from "react-native-international-phone-number";
import {
  Button,
  Card,
  HelperText,
  RadioButton,
  Text,
  useTheme,
} from "react-native-paper";
import { supabase } from "../lib/supabase";

import GoogleSignIn from "@/components/auth/google-sign-in";
import HorizontalLine from "@/components/ui/horizontal-line";
import InputField from "@/components/ui/input-field";
import PrimaryButton from "@/components/ui/primary-button";
import ScreenContainer from "@/components/ui/screen-container";
import { signupData, signupSchema } from "@/schemas/sign-up";

/**
 * Renders the registration form containing user types (Rider, Driver, or Both), name,
 * phone number, email address, password, and driving licence and profile photo upload fields
 * for Driver/Both user types, along with the Google sign in button.
 * User input is validated with the Zod schema and stored in Supabase Auth if succeessful.
 */
function SignUpScreen() {
  const [userType, setUserType] = useState("rider");
  const [drivingLicence, setDrivingLicence] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const { colors } = useTheme();
  const colorScheme = useColorScheme();

  // initialise React Hook Form with Zod schema validation
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<signupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      drivingLicence: "",
      profilePhoto: "",
    },
  });

  // clear error messages on user type changes.
  useEffect(() => {
    clearErrors();
  }, [userType, clearErrors]);

  // the react-native-international-phone-number package is using for
  // country code selection and phone number validation
  const [selectedCountry, setSelectedCountry] = useState<undefined | ICountry>(
    undefined,
  );
  function handleSelectedCountry(country: ICountry) {
    setSelectedCountry(country);
  }

  // Image upload code is adopted from the following resources:
  // https://docs.expo.dev/versions/latest/sdk/imagepicker/
  // https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native?queryGroups=database-method&database-method=sql#create-an-upload-widget

  /**
   * Opens the device media library and displays the selected image on the screen.
   */
  async function onSelectImage(field: "drivingLicence" | "profilePhoto") {
    try {
      // request permission to access the device media library
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Permission to access the media library is required.",
        );
        return;
      }

      // launch the device media library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const image = result.assets[0];
      if (!image.uri) {
        throw new Error("No image uri!");
      }

      // store the selected image's metadata in the form field and validate it
      setValue(
        field,
        {
          uri: image.uri,
          name: image.fileName ?? image.uri.split("/").pop() ?? "file",
          mimeType: image.mimeType,
          size: image.fileSize,
        },
        { shouldValidate: true },
      );
      if (field === "drivingLicence") {
        setDrivingLicence(image.uri);
      }
      if (field === "profilePhoto") {
        setProfilePhoto(image.uri);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  }

  /**
   * Uploads an image file to the specified Supabase storage bucket.
   */
  async function uploadImage(
    image: {
      uri: string;
      name: string;
      mimeType: string;
    },
    bucket: string,
  ) {
    // extract the file extension from a file name
    const fileExt = image.name.split(".").pop();
    // generate a random file name
    const filePath = `${Math.random()}.${fileExt}`;
    // convert the image uri to an array buffer.
    const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

    // upload the image to the storage bucket.
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, arraybuffer, {
        // fall back to jpeg if the mimeType is not defined
        contentType: image.mimeType ?? "image/jpeg",
      });

    if (error) {
      throw error;
    }

    return filePath;
  }

  /**
   * Handles form submission after Zod schema validations have passed.
   */
  async function onSubmit(values: signupData) {
    // validate phone number input
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

    // set error messages for image upload fields
    if ((userType === "driver" || userType === "both") && !drivingLicence) {
      setError("drivingLicence", {
        message: "Driving Licence photo is required.",
      });
      return;
    }

    if ((userType === "driver" || userType === "both") && !profilePhoto) {
      setError("profilePhoto", {
        message: "Profile photo is required.",
      });
      return;
    }

    let drivingLicenceUrl: string | null = null;
    let profilePhotoUrl: string | null = null;

    if (userType === "driver" || userType === "both") {
      drivingLicenceUrl = await uploadImage(values.drivingLicence, "licences");
      profilePhotoUrl = await uploadImage(values.profilePhoto, "profiles");
    }

    // register a new user with Supabase Auth
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
          role: userType,
          driving_licence: drivingLicenceUrl,
          profile_photo: profilePhotoUrl,
        },
      },
    });

    if (error) {
      Alert.alert(error.message);
      return;
    }

    // a session starts when a user verifies their email
    if (!session) {
      Alert.alert("Please check your inbox for email verification!");
      // clear input fields
      reset();
      setDrivingLicence(null);
      setProfilePhoto(null);
    }
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
              <RadioButton.Item
                label="Both"
                value="both"
                mode="android"
                position="leading"
              />
            </View>
          </RadioButton.Group>
          <View>
            <Controller
              name="name"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <InputField
                    label="Name"
                    mode="outlined"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={!!errors.name}
                  />
                  <HelperText
                    type="error"
                    visible={!!errors.name}
                    padding="none"
                  >
                    {errors.name?.message}
                  </HelperText>
                </View>
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View>
                  <PhoneInput
                    defaultCountry="IE"
                    placeholder="Mobile Number"
                    value={value}
                    onChangePhoneNumber={onChange}
                    selectedCountry={selectedCountry}
                    onChangeSelectedCountry={handleSelectedCountry}
                    theme={colorScheme === "dark" ? "dark" : "light"}
                    phoneInputStyles={{
                      container: { backgroundColor: colors.background },
                      flagContainer: { backgroundColor: colors.background },
                      caret: { color: colors.onBackground },
                      callingCode: { color: colors.onBackground },
                    }}
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
              name="email"
              control={control}
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
                    type="info"
                    visible={!errors.password}
                    padding="none"
                    className={!errors.password ? "flex" : "hidden"}
                  >
                    Password must be at least 6 characters.
                  </HelperText>
                  <HelperText
                    type="error"
                    visible={!!errors.password}
                    padding="none"
                    className={!!errors.password ? "flex" : "hidden"}
                  >
                    {errors.password?.message}
                  </HelperText>
                </View>
              )}
            />
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <InputField
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
            <Controller
              name="drivingLicence"
              control={control}
              render={() => (
                <View>
                  <Button
                    icon="file-upload"
                    mode="outlined"
                    onPress={() => {
                      onSelectImage("drivingLicence");
                    }}
                    disabled={userType === "rider"}
                  >
                    {drivingLicence
                      ? "Change Driving Licence"
                      : "Select Driving Licence"}
                  </Button>
                  {drivingLicence && (
                    <Card>
                      <Card.Cover source={{ uri: drivingLicence }} />
                    </Card>
                  )}
                  <HelperText
                    type="error"
                    visible={!!errors.drivingLicence}
                    padding="none"
                  >
                    {errors.drivingLicence?.message?.toString()}
                  </HelperText>
                </View>
              )}
            />
            <Controller
              name="profilePhoto"
              control={control}
              render={() => (
                <View>
                  <Button
                    icon="file-upload"
                    mode="outlined"
                    onPress={() => {
                      onSelectImage("profilePhoto");
                    }}
                    disabled={userType === "rider"}
                  >
                    {profilePhoto
                      ? "Change Profile Photo"
                      : "Select Profile Photo"}
                  </Button>
                  {profilePhoto && (
                    <Card>
                      <Card.Cover source={{ uri: profilePhoto }} />
                    </Card>
                  )}
                  <HelperText
                    type="error"
                    visible={!!errors.profilePhoto}
                    padding="none"
                  >
                    {errors.profilePhoto?.message?.toString()}
                  </HelperText>
                </View>
              )}
            />
          </View>
          <PrimaryButton onPress={handleSubmit(onSubmit)}>
            Sign Up
          </PrimaryButton>
        </View>
        <View className="flex-row items-center gap-2 my-4">
          <HorizontalLine />
          <Text>or</Text>
          <HorizontalLine />
        </View>
        <GoogleSignIn />

        <View className="flex-row justify-center gap-2 mt-8">
          <Text variant="bodyLarge">Already have an account?</Text>
          <Link href="/">
            <Text
              variant="bodyLarge"
              theme={{ colors: { onSurface: colors.primary } }}
            >
              Sign in
            </Text>
          </Link>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export default SignUpScreen;
