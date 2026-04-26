import { supabase } from "../../lib/supabase";

/**
 * Creates a new data entry in the vehicle table.
 *
 * @param vehicleReg The vehicle registration number
 * @param vehicleTransmission The transmission type
 * @returns A newly created vehicle record inclucing its ID
 */
export default async function createVehicle(
  vehicleReg: string | undefined,
  vehicleTransmission: string,
) {
  // insert a new entry to the vehicle table
  const { data, error } = await supabase
    .from("vehicle")
    .insert({
      reg: vehicleReg,
      transmission_type: vehicleTransmission,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}
