import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export type PickedImage = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
};

/**
 * Request permission to access the device media library,
 * opens the image picker, and returns the selected image.
 *
 * @param options aspect
 * @returns A selected image's metadata: URI, name, MIME type, and size
 */
export async function pickImage(
  options?: Pick<ImagePicker.ImagePickerOptions, "aspect">,
) {
  // The code is modified based on https://docs.expo.dev/versions/latest/sdk/imagepicker/

  // request permission to access the device media library
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Permission required",
      "Permission to access the media library is required.",
    );
    return null;
  }

  // launch the device media library
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 1,
    ...options,
  });

  if (result.canceled || !result.assets?.length) return null;

  const image = result.assets[0];
  if (!image.uri) throw new Error("No image uri!");

  return {
    uri: image.uri,
    name: image.fileName ?? image.uri.split("/").pop() ?? "image.jpg",
    mimeType: image.mimeType ?? "image/jpeg",
    size: image.fileSize,
  };
}
