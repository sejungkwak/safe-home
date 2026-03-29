import { StyleSheet } from "react-native";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";

function Map() {
  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      showsUserLocation={true}
      style={styles.map}
    ></MapView>
  );
}

export default Map;

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
