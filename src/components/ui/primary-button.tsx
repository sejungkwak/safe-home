import { ReactNode } from "react";
import { Button } from "react-native-paper";

function PrimaryButton({
  children,
  ...props
}: {
  children: ReactNode;
  [key: string]: any;
}) {
  return (
    <Button labelStyle={{ fontSize: 18, height: 25 }} {...props}>
      {children}
    </Button>
  );
}

export default PrimaryButton;
