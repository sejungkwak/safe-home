import { TextInput } from "react-native-paper";

function InputField({ ...props }) {
  return (
    <TextInput
      outlineStyle={{ borderWidth: 2, borderRadius: 10 }}
      left={props.icon && <TextInput.Icon icon={props.icon} />}
      {...props}
    />
  );
}

export default InputField;
