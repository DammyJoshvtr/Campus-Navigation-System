import React, { useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import { View, Text, Button } from "react-native";
import BottomSheet, {
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

const LocationSheet = forwardRef((props, ref) => {
  const modalRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  // useImperativeHandle(ref, () => ({
  //   open: () => modalRef.current?.expand(),
  // }));

  return (
    <BottomSheet
      ref={modalRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <BottomSheetView
        style={{ padding: 20 }}
        className="bg-black rounded-t-3xl"
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Bottom Sheet Works 🎉
        </Text>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default LocationSheet;
