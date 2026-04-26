import { MapPin, LocateFixed, Locate } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, Text } from "react-native";

interface Props {
  onPress?: () => void;
}

const FAB = ({ onPress, useIcon }: Props & { useIcon: boolean }) => {
  return (
    <TouchableOpacity
      style={[styles.fab, !useIcon && { backgroundColor: "white" }]}
      onPress={onPress}
    >
      {useIcon ? (
        <MapPin size={22} color="#fff" />
      ) : (
        <LocateFixed size={22} color="#2563EB" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    /* position: "absolute", */
    /* bottom: 30, */
    /* right: 20, */
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5 /* Android shadow */,
  },
  secondFab: {},
});

export default FAB;
