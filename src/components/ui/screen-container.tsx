import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function ScreenContainer({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.rootContainer}>
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
}

export default ScreenContainer;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
});
