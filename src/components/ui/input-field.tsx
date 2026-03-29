import { TextInput } from "react-native-paper";

function InputField({ ...props }) {
  return (
    <TextInput outlineStyle={{ borderWidth: 2, borderRadius: 10 }} {...props} />
  );
}

export default InputField;
