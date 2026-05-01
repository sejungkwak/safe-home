import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { ICountry } from "react-native-international-phone-number";
import {
  Button,
  Card,
  HelperText,
  Icon,
  RadioButton,
  Text,
  useTheme,
} from "react-native-paper";

import fetchProfile from "@/api/profiles/fetch-profile";
import updateProfile from "@/api/profiles/update-profile";
import uploadImage from "@/api/storage/upload-image";
import MapSearch from "@/components/map/map-search";
import HorizontalLine from "@/components/ui/horizontal-line";
import InputField from "@/components/ui/input-field";
import PhoneField from "@/components/ui/phone-field";
import PrimaryButton from "@/components/ui/primary-button";
import ScreenContainer from "@/components/ui/screen-container";
import { useSession } from "@/context/auth";
import { useRole } from "@/context/role";
import { PickedImage, pickImage } from "@/lib/pick-image";
import { supabase } from "@/lib/supabase";
import { validatePhoneNumber } from "@/lib/validate-phone-number";
import { ProfileData, profileSchema } from "@/schemas/profile";

/**
 * Renders account information based on the user's role.
 * Users can update their profile photo, name, phone number,
 * email address, and password (non-Google sign-in users only).
 * Riders can update their default address and default vehicle.
 * Drivers can update their driver licence photo.
 */
export default function AccountScreen() {
  const { user } = useSession();
  const { role } = useRole();
  const { colors } = useTheme();
  const { focus } = useLocalSearchParams();

  const isRider = role === "rider";
  const isDriver = role === "driver";
  const isGoogleUser = user?.app_metadata?.provider === "google";

  const [selectedCountry, setSelectedCountry] = useState<ICountry | undefined>(
    undefined,
  );
  const [currentEmail, setCurrentEmail] = useState<string | undefined>(
    undefined,
  );
  const [savedAddress, setSavedAddress] = useState<string | undefined>(
    undefined,
  );
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [newProfilePhoto, setNewProfilePhoto] = useState<PickedImage | null>(
    null,
  );
  const [licencePhoto, setLicencePhoto] = useState<string | null>(null);
  const [newLicencePhoto, setNewLicencePhoto] = useState<PickedImage | null>(
    null,
  );
  const [driverVerification, setDriverVerification] = useState<string | null>(
    null,
  );
  const profileLoaded = useRef(false);
  const vehicleRef = useRef<TextInput | null>(null);

  const {
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      resetPassword: "",
      confirmResetPassword: "",
      address: undefined,
      vehicleReg: "",
      vehicleTransmission: "manual",
      drivingLicence: "",
      profilePhoto: "",
    },
  });

  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      // retrieve signed-in user's information from database
      const data = await fetchProfile(user.id);
      if (!data) return;

      // set retrieved values to corresponding input fields
      setValue("name", data.name ?? "");
      const storedPhone = data.phone ?? "";
      const localPhone = storedPhone.includes(" ")
        ? storedPhone.slice(storedPhone.indexOf(" ") + 1)
        : storedPhone;
      setValue("phone", localPhone);
      setCurrentEmail(data.email ?? undefined);
      setValue("email", data.email ?? "");
      const addressObj = data.address as {
        latitude: number;
        longitude: number;
        address: string;
      } | null;
      setSavedAddress(addressObj?.address ?? undefined);

      if (data.profile_photo) {
        const { data: profilePhotoData } = supabase.storage
          .from("profiles")
          .getPublicUrl(data.profile_photo);
        setProfilePhoto(profilePhotoData.publicUrl);
      }

      if (data.driving_licence) {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("licences")
            .createSignedUrl(data.driving_licence, 3600);
        if (signedUrlData) {
          setLicencePhoto(signedUrlData.signedUrl);
        }
        if (signedUrlError) throw signedUrlError;
      }

      if (data.driver_verification) {
        setDriverVerification(data.driver_verification.status);
      }

      if (data.vehicle) {
        setVehicleId(data.vehicle.id);
        setValue("vehicleReg", data.vehicle.reg ?? "");
        setValue(
          "vehicleTransmission",
          data.vehicle.transmission_type ?? "manual",
        );
      }

      profileLoaded.current = true;
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    }
  }, [user, setValue]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (focus === "vehicleReg") vehicleRef.current?.focus();
  }, [focus]);

  async function onSelectProfilePhoto() {
    await handleImageSelection(setProfilePhoto, setNewProfilePhoto, {
      aspect: [1, 1],
    });
  }

  async function onChangeLicence() {
    await handleImageSelection(setLicencePhoto, setNewLicencePhoto);
  }

  /**
   * Opens the device media library,
   * and lets the user select an image.
   */
  async function handleImageSelection(
    setCurrentImage: (uri: string) => void,
    setNewImage: (image: PickedImage) => void,
    options?: Parameters<typeof pickImage>[0],
  ) {
    try {
      const image = await pickImage(options);
      if (!image) return;

      setCurrentImage(image.uri);
      setNewImage(image);
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    }
  }

  /**
   * Handles form submission after Zod schema validations have passed.
   */
  async function onSubmit(values: ProfileData) {
    if (!user) return;
    Keyboard.dismiss();

    const fullPhone = validatePhoneNumber(values.phone, selectedCountry);
    if (!fullPhone) {
      setError("phone", { message: "Invalid mobile number." });
      return;
    }

    try {
      const isNewEmail = !!values.email && values.email !== currentEmail;

      let profilePhotoPath: string | undefined;
      if (newProfilePhoto) {
        profilePhotoPath = await uploadImage(newProfilePhoto, "profiles");
      }

      let drivingLicencePath: string | undefined;

      if (isDriver) {
        if (newLicencePhoto) {
          drivingLicencePath = await uploadImage(newLicencePhoto, "licences");
        }

        await updateProfile({
          userId: user.id,
          name: values.name,
          email: isNewEmail ? values.email : undefined,
          phone: fullPhone,
          profilePhotoPath,
          drivingLicencePath,
          resetPassword: values.resetPassword || undefined,
        });
      } else {
        await updateProfile({
          userId: user.id,
          name: values.name,
          phone: fullPhone,
          email: isNewEmail ? values.email : undefined,
          address: values.address === undefined ? undefined : values.address,
          profilePhotoPath,
          vehicleId: vehicleId,
          vehicleReg: values.vehicleReg,
          vehicleTransmission: values.vehicleTransmission,
          resetPassword: isGoogleUser
            ? undefined
            : values.resetPassword || undefined,
        });
      }

      setValue("resetPassword", "");
      setValue("confirmResetPassword", "");
      setNewProfilePhoto(null);
      setNewLicencePhoto(null);
      await loadProfile();
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      if (error instanceof Error) Alert.alert("Error", error.message);
    }
  }

  return (
    <ScreenContainer>
      <ScrollView>
        <Controller
          name="profilePhoto"
          control={control}
          render={() => (
            <View className="items-center my-6">
              <Pressable onPress={onSelectProfilePhoto}>
                {profilePhoto ? (
                  <Image
                    source={{ uri: profilePhoto }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                    }}
                  />
                ) : (
                  <View
                    className="justify-center items-center shrink-0 grow-0 size-20 rounded-full border-2"
                    style={{ borderColor: colors.onSurface }}
                  >
                    <Icon source="account" size={64} color={colors.onSurface} />
                  </View>
                )}
              </Pressable>
            </View>
          )}
        />

        <View className="mx-2 mb-2">
          <View className="flex-row gap-2 items-center mb-2">
            <Icon source="account-circle-outline" size={20} />
            <Text variant="titleMedium">Personal information</Text>
          </View>
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
                <HelperText type="error" visible={!!errors.name} padding="none">
                  {errors.name?.message}
                </HelperText>
              </View>
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field: { onChange, value } }) => (
              <PhoneField
                value={value}
                onChange={onChange}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                errorMessage={errors.phone?.message}
              />
            )}
          />
          {/* Email: read-only if a user has signed-in with Google */}
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
                  disabled={isGoogleUser}
                  error={!isGoogleUser && !!errors.email}
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

          {!isGoogleUser && (
            <>
              <Controller
                name="resetPassword"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <InputField
                      label="Reset Password"
                      mode="outlined"
                      autoCapitalize="none"
                      secureTextEntry
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      error={!!errors.resetPassword}
                    />
                    <HelperText
                      type="error"
                      visible={!!errors.resetPassword}
                      padding="none"
                    >
                      {errors.resetPassword?.message}
                    </HelperText>
                  </View>
                )}
              />
              <Controller
                name="confirmResetPassword"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <InputField
                      label="Confirm Reset Password"
                      mode="outlined"
                      autoCapitalize="none"
                      secureTextEntry
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      error={!!errors.confirmResetPassword}
                    />
                    <HelperText
                      type="error"
                      visible={!!errors.confirmResetPassword}
                      padding="none"
                    >
                      {errors.confirmResetPassword?.message}
                    </HelperText>
                  </View>
                )}
              />
            </>
          )}
        </View>

        {isRider && (
          <>
            <View className="mx-2 mt-0 mb-4">
              <HorizontalLine />
            </View>
            <View className="mx-2 mb-2">
              <View className="flex-row gap-2 items-center mb-2">
                <Icon source="map-marker-outline" size={20} />
                <Text variant="titleMedium">Address</Text>
              </View>
              <Controller
                name="address"
                control={control}
                render={({ field: { onChange } }) => (
                  <MapSearch
                    placeholder="Home Address"
                    icon="map-marker-outline"
                    defaultValue={savedAddress}
                    onSelect={(coords) => onChange(coords)}
                    onClear={() => profileLoaded.current && onChange(null)}
                  />
                )}
              />
            </View>
          </>
        )}

        {isRider && (
          <>
            <View className="mx-2 my-4">
              <HorizontalLine />
            </View>
            <View className="mx-2 mb-4">
              <View className="flex-row gap-2 items-center mb-2">
                <Icon source="car-outline" size={20} />
                <Text variant="titleMedium">Vehicle</Text>
              </View>
              <Controller
                name="vehicleTransmission"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text variant="bodyMedium" className="mt-2 ms-2">
                      Transmission
                    </Text>
                    <RadioButton.Group
                      onValueChange={onChange}
                      value={value ?? "manual"}
                    >
                      <View className="flex-row">
                        <RadioButton.Item
                          label="Manual"
                          value="manual"
                          mode="android"
                          position="leading"
                        />
                        <RadioButton.Item
                          label="Automatic"
                          value="automatic"
                          mode="android"
                          position="leading"
                        />
                      </View>
                    </RadioButton.Group>
                  </View>
                )}
              />
              <Controller
                name="vehicleReg"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <InputField
                      label="Registration Number"
                      mode="outlined"
                      autoCapitalize="characters"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      error={!!errors.vehicleReg}
                      ref={vehicleRef}
                    />
                    <HelperText
                      type="error"
                      visible={!!errors.vehicleReg}
                      padding="none"
                    >
                      {errors.vehicleReg?.message}
                    </HelperText>
                  </View>
                )}
              />
            </View>
          </>
        )}

        {/* Driver view: Driving licence + verification status */}
        {isDriver && (
          <>
            <View className="mx-2 my-2">
              <HorizontalLine />
            </View>
            <View className="mx-2 mb-4">
              <View className="flex-row gap-2 items-center mb-2">
                <Icon source="card-account-details-outline" size={20} />
                <Text variant="titleMedium">Driving Licence</Text>
              </View>
              <Controller
                name="drivingLicence"
                control={control}
                render={() => (
                  <View>
                    <Button
                      icon="file-upload"
                      mode="outlined"
                      onPress={onChangeLicence}
                    >
                      {licencePhoto
                        ? "Change Driving Licence"
                        : "Select Driving Licence"}
                    </Button>
                    {licencePhoto && (
                      <Card>
                        <Card.Cover source={{ uri: licencePhoto }} />
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
              <View className="flex-row gap-2 items-center mb-4">
                <Icon
                  source={
                    driverVerification === "verified"
                      ? "check-circle"
                      : driverVerification === "rejected"
                        ? "cancel"
                        : "clock-outline"
                  }
                  size={20}
                  color={colors.onSurface}
                />
                <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
                  {driverVerification === "verified"
                    ? "Verified"
                    : driverVerification === "rejected"
                      ? "Awaiting new licence upload"
                      : "Verification pending"}
                </Text>
              </View>
            </View>
          </>
        )}

        <PrimaryButton onPress={handleSubmit(onSubmit)}>Update</PrimaryButton>
      </ScrollView>
    </ScreenContainer>
  );
}
