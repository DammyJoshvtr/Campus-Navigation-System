import { AntDesign } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";

interface Props {
  onPress: () => void;
}

const FAB = ({ onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <AntDesign name="environment" size={24} color="white" />
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
});

export default FAB;
