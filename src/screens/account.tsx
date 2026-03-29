import { Button } from "react-native-paper";

import ScreenContainer from "@/components/ui/screen-container";
import ScreenTitle from "@/components/ui/screen-title";
import { useSession } from "@/ctx";

export default function AccountScreen() {
  const { signOut } = useSession();

  return (
    <ScreenContainer>
      <ScreenTitle>Account</ScreenTitle>
      <Button mode="contained" onPress={signOut}>
        Sign Out
      </Button>
    </ScreenContainer>
  );
}
