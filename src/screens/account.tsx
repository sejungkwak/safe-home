import { Button } from "react-native-paper";

import ScreenContainer from "@/components/ui/screen-container";
import { useSession } from "@/context/auth";

export default function AccountScreen() {
  const { signOut } = useSession();

  return (
    <ScreenContainer>
      <Button mode="contained" onPress={signOut}>
        Sign Out
      </Button>
    </ScreenContainer>
  );
}
