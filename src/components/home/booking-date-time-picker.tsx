import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Button, Platform } from "react-native";
import DateFormatter from "./date-formatter";

type PickerMode = "date" | "time";

/**
 * Displays a date or time picker using @react-native-community/datetimepicker
 */
export default function BookingDateTimePicker({
  pickerType,
  onClose,
  selectedValue,
}: {
  pickerType: PickerMode;
  onClose: () => void;
  selectedValue: (value: string) => void;
}) {
  // set the default date to an hour from now which is earliest available
  // booking time
  const now = new Date();
  const minSelectable = new Date(now);
  minSelectable.setHours(minSelectable.getHours() + 1);

  const [date, setDate] = useState(pickerType === "date" ? minSelectable : now);

  const maxSelectable = new Date(now);
  maxSelectable.setDate(now.getDate() + 90);

  // update the date or time and pass the value to the parent component
  function onSelect(_event: any, selectedDate?: Date) {
    // close the modal on Android
    // on iOS, it closes when the confirm button is pressed.
    if (Platform.OS === "android") onClose();

    if (selectedDate) {
      setDate(selectedDate);

      // convert date and time to string
      const { formattedDate, formattedTime } = DateFormatter(selectedDate);
      selectedValue(pickerType === "date" ? formattedDate : formattedTime);
    }
  }

  // use inline for date and spinner for time on iOS
  const display =
    Platform.OS === "ios"
      ? pickerType === "date"
        ? "inline"
        : "spinner"
      : "default";

  // set the time to 00:00
  const minTime = new Date(new Date().setHours(0, 0, 0, 0));
  // set the time to 23:59
  const maxTime = new Date(new Date().setHours(23, 59, 59, 999));

  // set the minimumDate and maximumDate values based on the pickerType
  const minMaxDate =
    pickerType === "date"
      ? { minimumDate: minSelectable, maximumDate: maxSelectable }
      : { minimumDate: minTime, maximumDate: maxTime };

  return (
    <>
      <DateTimePicker
        value={date}
        mode={pickerType}
        display={display}
        is24Hour={true}
        minuteInterval={10}
        {...minMaxDate}
        onChange={onSelect}
      />
      {Platform.OS === "ios" && <Button title="Confirm" onPress={onClose} />}
    </>
  );
}
