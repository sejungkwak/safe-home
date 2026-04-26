import { View, useColorScheme } from "react-native";
import PhoneInput, { ICountry } from "react-native-international-phone-number";
import { HelperText, useTheme } from "react-native-paper";

/**
 * Renders an international phone number input component.
 *
 * @param value The current phone number
 * @param onChange A function called when phone number input changes
 * @param selectedCountry The current country
 * @param onCountryChange A function called when a new country is selected
 * @param errorMessage Error messages
 */
export default function PhoneField({
  value,
  onChange,
  selectedCountry,
  onCountryChange,
  errorMessage,
}: {
  value: string;
  onChange: (value: string) => void;
  selectedCountry: ICountry | undefined;
  onCountryChange: (country: ICountry) => void;
  errorMessage?: string;
}) {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();

  return (
    <View>
      <PhoneInput
        defaultCountry="IE"
        placeholder="Mobile Number"
        value={value}
        onChangePhoneNumber={onChange}
        selectedCountry={selectedCountry}
        onChangeSelectedCountry={onCountryChange}
        theme={colorScheme === "dark" ? "dark" : "light"}
        phoneInputStyles={{
          container: { backgroundColor: colors.surface },
          flagContainer: { backgroundColor: colors.surface },
          caret: { color: colors.onSurface },
          callingCode: { color: colors.onSurface },
        }}
      />
      <HelperText type="error" visible={!!errorMessage} padding="none">
        {errorMessage}
      </HelperText>
    </View>
  );
}
