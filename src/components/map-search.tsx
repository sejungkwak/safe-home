import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { cssInterop } from "nativewind";
import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import { Icon, useTheme } from "react-native-paper";

cssInterop(View, { className: { target: "style" } });

export default function MapSearch({
  onSelect,
  onClear,
  searchFor,
  ...props
}: {
  onSelect: (coordinates: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  onClear: () => void;
  searchFor: "origin" | "destination";
  placeholder: string;
  icon: string;
  defaultValue?: string;
}) {
  const { colors } = useTheme();

  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);

  useEffect(() => {
    if (props.defaultValue) {
      placesRef.current?.setAddressText(props.defaultValue);
    }
  }, [props.defaultValue]);

  return (
    <GooglePlacesAutocomplete
      ref={placesRef}
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
        onChangeText: (text) => {
          if (text === "") onClear?.();
        },
      }}
      styles={{
        textInputContainer: {
          borderStartWidth: 2,
          borderEndWidth: 2,
          borderTopWidth: searchFor === "origin" ? 2 : 1,
          borderBottomWidth: searchFor === "origin" ? 1 : 2,
          borderColor: colors.onBackground,
          borderTopLeftRadius: searchFor === "origin" ? 10 : 0,
          borderTopRightRadius: searchFor === "origin" ? 10 : 0,
          borderBottomLeftRadius: searchFor === "origin" ? 0 : 10,
          borderBottomRightRadius: searchFor === "origin" ? 0 : 10,
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
        if (data && details) {
          const latitude = details.geometry.location.lat;
          const longitude = details.geometry.location.lng;
          const address = data.description;

          onSelect({ latitude, longitude, address });
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
