import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import React from "react";
import { View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Icon, useTheme } from "react-native-paper";

cssInterop(View, { className: { target: "style" } });

export default function MapSearch({ ...props }) {
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
      onPress={(data, details = null) => {
        console.log(data, details); // TODO add code to get the location's coords.
      }}
      query={{
        key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        language: "en",
        components: "country:ie", // limit results to Ireland
      }}
    />
  );
}
