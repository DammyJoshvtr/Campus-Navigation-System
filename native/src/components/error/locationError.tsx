import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { WifiOff } from "lucide-react-native";

interface Props {
  reload: () => void;
  close: () => void;
}

const LocationError = ({ reload, close }: Props) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <WifiOff size={40} color="#DC2626" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Network Error</Text>

        {/* Description */}
        <Text style={styles.message}>
          We couldn’t load location data. Please check your internet connection
          and try again.
        </Text>

        {/* Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.retryBtn} onPress={reload}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={close}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LocationError;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: 300,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 10,
    alignItems: "center",
  },

  iconContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 50,
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  message: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  retryBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  closeBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  closeText: {
    color: "#111827",
    fontWeight: "600",
  },
});
