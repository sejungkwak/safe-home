import { ReactNode } from "react";
import { Button, useTheme } from "react-native-paper";

export default function PrimaryButton({
  children,
  mode = "contained",
  ...props
}: {
  children: ReactNode;
  mode?: "outlined" | "contained";
  [key: string]: any;
}) {
  const { colors } = useTheme();
  const outlined = mode === "outlined";

  return (
    <Button
      labelStyle={{ fontSize: 18, height: 25 }}
      buttonColor={outlined ? colors.background : colors.primary}
      textColor={outlined ? colors.primary : colors.background}
      style={[
        {
          flex: 1,
          minHeight: 40,
        },
        outlined && {
          borderColor: colors.primary,
          borderWidth: 1,
          paddingBlock: 4,
        },
      ]}
      {...props}
    >
      {children}
    </Button>
  );
}
