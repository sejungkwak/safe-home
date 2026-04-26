import {
  ICountry,
  isValidPhoneNumber,
} from "react-native-international-phone-number";

/**
 * Validates the entered phone number.
 *
 * @param phoneNumber The entered phone number
 * @param country The selected country code
 * @returns The full phone number
 */
export function validatePhoneNumber(
  phoneNumber: string,
  country: ICountry | undefined,
) {
  const isValid = isValidPhoneNumber(phoneNumber, country as ICountry);

  if (!isValid) return null;

  return `${country?.idd?.root} ${phoneNumber}`;
}
