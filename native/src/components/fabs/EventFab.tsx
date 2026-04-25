import { Plus } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

const FAB = () => {
  return (
    <TouchableOpacity
      style={{
        height: 60,
        width: 60,
        borderRadius: 999,
        backgroundColor: "#2563EB",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Plus size={25} color="white" strokeWidth={2} />
    </TouchableOpacity>
  );
};

export default FAB;
