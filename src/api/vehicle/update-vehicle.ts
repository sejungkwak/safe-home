import { supabase } from "../../lib/supabase";

/**
 * Updates the vehicle table.
 *
 * @param vehicleId The vehicle ID to update
 * @param vehicleReg The vehicle registration number
 * @param vehicleTransmission The transmission type
 * @returns An updated vehicle record from database
 */
export default async function updateVehicle(
  vehicleId: string | undefined,
  vehicleReg: string | undefined,
  vehicleTransmission: string,
) {
  // update the vehicle table
  const { data, error } = await supabase
    .from("vehicle")
    .update({
      reg: vehicleReg,
      transmission_type: vehicleTransmission,
    })
    .eq("id", vehicleId)
    .select();

  if (error) throw error;

  return data;
}
