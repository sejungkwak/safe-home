import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import React from "react";
import { View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Icon, useTheme } from "react-native-paper";

cssInterop(View, { className: { target: "style" } });

export default function MapSearch({
  onSelect,
  ...props
}: {
  onSelect: (coordinates: { latitude: number; longitude: number }) => void;
  placeholder: string;
  icon: string;
}) {
  const { colors } = useTheme();

  return (
    <GooglePlacesAutocomplete
      placeholder={props.placeholder}
      renderLeftButton={() => (
        <View className="justify-center items-center ps-2">
          <Icon source={props.icon} size={20} color={colors.onBackground} />
        </View>
      )}
      minLength={3}
      textInputProps={{
        InputComp: BottomSheetTextInput,
        placeholderTextColor: colors.onBackground,
        autoCorrect: false,
      }}
      styles={{
        textInputContainer: {
          borderWidth: 2,
          borderColor: colors.onBackground,
          borderRadius: 10,
          marginInline: 8,
        },
        textInput: {
          backgroundColor: colors.background,
          color: colors.onBackground,
        },
        listView: {
          backgroundColor: colors.background,
        },
        row: {
          backgroundColor: colors.background,
        },
        description: {
          backgroundColor: colors.background,
          color: colors.onBackground,
          fontSize: 16,
        },
        poweredContainer: {
          backgroundColor: colors.background,
          color: colors.onBackground,
        },
      }}
      fetchDetails={true}
      onPress={(data, details = null) => {
        if (details) {
          const latitude = details.geometry.location.lat;
          const longitude = details.geometry.location.lng;

          onSelect({ latitude, longitude });
        }
      }}
      query={{
        key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        language: "en",
        components: "country:ie", // limit results to Ireland
      }}
    />
  );
}
