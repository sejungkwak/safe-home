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

/**
 * A Google Places address search input component.
 * It renders either two fields, origin with a default value and destination,
 * or a single address field used on the account screen.
 * It allows a user to search for a place by address, clearing the input, and
 * sends the selected place's coordinates and address to the parent component.
 *
 * @param onSelect A function called when a place is selected
 * @param onClear A function called when the input is cleared
 * @param searchFor Input field information, "origin" or "destination"
 * @returns A customised GooglePlacesAutocomplete component
 */
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
  searchFor?: "origin" | "destination";
  placeholder: string;
  icon: string;
  defaultValue?: string;
}) {
  const { colors } = useTheme();

  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);

  useEffect(() => {
    if (props.defaultValue) {
      placesRef.current?.setAddressText(props.defaultValue);
    } else {
      placesRef.current?.clear();
    }
  }, [props.defaultValue]);

  // place the component inside a bottom sheet if searchFor exists
  const inBottomSheet = searchFor !== undefined;

  const borderStyle = inBottomSheet
    ? {
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
      }
    : {
        borderWidth: 2,
        borderRadius: 10,
        borderColor: colors.outline,
        marginHorizontal: 2,
      };

  return (
    <GooglePlacesAutocomplete
      ref={placesRef}
      key={props.defaultValue ?? ""}
      placeholder={props.placeholder}
      renderLeftButton={() => (
        <View className="justify-center items-center ps-2">
          {searchFor && (
            <Icon
              source={props.icon}
              size={20}
              color={
                searchFor === "origin" ? colors.onBackground : colors.primary
              }
            />
          )}
        </View>
      )}
      minLength={3}
      textInputProps={{
        ...(inBottomSheet && { InputComp: BottomSheetTextInput }),
        placeholderTextColor: colors.onBackground,
        autoCorrect: false,
        onChangeText: (text) => {
          if (text === "") onClear?.();
        },
      }}
      styles={{
        container: {
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: "auto",
        },
        textInputContainer: borderStyle,
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
      keepResultsAfterBlur={true}
      keyboardShouldPersistTaps="always"
      isRowScrollable={false}
      onPress={(data, details = null) => {
        if (data && details) {
          const latitude = details.geometry.location.lat;
          const longitude = details.geometry.location.lng;
          const address = data.description;

          onSelect({ latitude, longitude, address });
        }
      }}
      debounce={300}
      query={{
        key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        language: "en",
        types: "address",
        components: "country:ie", // limit results to Ireland
      }}
      disableScroll
    />
  );
}
