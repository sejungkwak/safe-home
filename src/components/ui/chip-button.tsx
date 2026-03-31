import { ReactNode } from "react";
import { Button, useTheme } from "react-native-paper";

export default function ChipButton({
  children,
  ...props
}: {
  children: ReactNode;
  icon: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Button
      mode="elevated"
      compact={true}
      buttonColor={colors.onBackground}
      textColor={colors.background}
      style={{ alignSelf: "flex-start", margin: 8, borderRadius: 20 }}
      icon={props.icon}
      onPress={props.onPress}
    >
      {children}
    </Button>
  );
}
