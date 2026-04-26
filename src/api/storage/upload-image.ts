import { supabase } from "@/lib/supabase";

/**
 * Uploads an image file to the specified Supabase storage bucket,
 * and returns the uplodaed file path.
 *
 * @param image The image file to upload
 * @param bucket Supabase storage bucket to upload the image
 * @returns The uploaded image file path
 */
export default async function uploadImage(
  image: {
    uri: string;
    name: string;
    mimeType: string;
  },
  bucket: string,
) {
  // The code is modified based on
  // https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native?queryGroups=database-method&database-method=sql#create-an-upload-widget

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
