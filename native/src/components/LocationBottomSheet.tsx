import React, { useCallback, useMemo, forwardRef } from "react";
import { Text, StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

const LocationBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const backdrop = useCallback(
    (backdropProps: any) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={1}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      index={-1}
      snapPoints={snapPoints}
      ref={ref}
      enablePanDownToClose={true}
      backdropComponent={backdrop}
    >
      <BottomSheetView
        style={{ padding: 20 }}
        className="bg-black rounded-t-3xl"
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
          Bottom Sheet Works 🎉
        </Text>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default LocationBottomSheet;
