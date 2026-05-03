import { supabase } from "../../lib/supabase";
import createVehicle from "../vehicle/create-vehicle";
import updateVehicle from "../vehicle/update-vehicle";

type UpdateProfileParams = {
  userId: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: { latitude: number; longitude: number; address: string } | null;
  profilePhotoPath?: string;
  drivingLicencePath?: string;
  vehicleId?: string | null;
  vehicleReg?: string;
  vehicleTransmission?: "manual" | "automatic";
  resetPassword?: string;
  driverVerification?: boolean;
};

/**
 * Updates the profile and vehicle information in database.
 *
 * @param updatedProfile The updated profile information
 */
export default async function updateProfile(
  updatedProfile: UpdateProfileParams,
) {
  const {
    userId,
    name,
    phone,
    email,
    address,
    profilePhotoPath,
    drivingLicencePath,
    vehicleId,
    vehicleReg,
    vehicleTransmission,
    resetPassword,
  } = updatedProfile;

  // update name, email and password in Supabase Auth
  if (name) {
    const { error } = await supabase.auth.updateUser({
      data: { display_name: name },
    });
    if (error) throw error;
  }

  if (email) {
    const { error } = await supabase.auth.updateUser({ email: email });
    if (error) throw error;
  }

  if (resetPassword) {
    const { error } = await supabase.auth.updateUser({
      password: resetPassword,
    });
    if (error) throw error;
  }

  let newVehicleId = vehicleId;

  if (vehicleReg) {
    if (vehicleId) {
      // update the vehicle row if the ID exists
      await updateVehicle(
        vehicleId,
        vehicleReg,
        vehicleTransmission ?? "menual",
      );
    } else {
      // insert a new vehicle record.
      const vehicleData = await createVehicle(
        vehicleReg,
        vehicleTransmission ?? "manual",
      );

      if (!vehicleData) return;

      newVehicleId = vehicleData.id;
    }
  }

  // update only the provided fields
  const updates = {
    ...(name !== undefined && { name }),
    ...(phone !== undefined && { phone }),
    ...(email !== undefined && { email }),
    ...(address !== undefined && { address: address || null }),
    ...(profilePhotoPath && { profile_photo: profilePhotoPath }),
    ...(drivingLicencePath && {
      driving_licence: drivingLicencePath,
    }),
    ...(newVehicleId !== vehicleId && { vehicle_id: newVehicleId }),
  };

  // update profile table
  const { error } = await supabase
    .from("profile")
    .update(updates)
    .eq("id", userId);

  if (error) throw error;
}
