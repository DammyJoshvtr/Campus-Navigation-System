import React, { useCallback, useMemo, forwardRef } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import useLocations from "@/hooks/getLocation";

type Props = {
  location?: {
    name: string;
    type: string;
    description?: string;
  };
};

const LocationBottomSheet = forwardRef<BottomSheet, Props>(
  ({ location }, ref) => {
    const snapPoints = useMemo(() => ["25%", "50%"], []);

    const backdrop = useCallback(
      (backdropProps: any) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      [],
    );

    const { coords = [], loading } = useLocations();

    React.useEffect(() => {
      console.log("Coords from BottomSheet", coords.slice(0, 5));
    }, [coords]);

    return (
      <BottomSheet
        index={-1}
        snapPoints={snapPoints}
        ref={ref}
        enablePanDownToClose
        backdropComponent={backdrop}
      >
        <BottomSheetView style={styles.container}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Location Name */}
          <Text style={styles.title}>
            {location?.name || "Select a location"}
          </Text>

          {/* Type */}
          <Text style={styles.type}>{location?.type || "No category"}</Text>

          {/* Description */}
          <Text style={styles.description}>
            {location?.description ||
              "Tap on a marker to view more details about the location."}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryText}>Get Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Save</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default LocationBottomSheet;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  type: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 20,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  secondaryBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  secondaryText: {
    color: "#111827",
    fontWeight: "600",
  },
});
