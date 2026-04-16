import BottomSheet from "@gorhom/bottom-sheet";
import React, { useMemo, forwardRef } from "react";
import { View, Text } from "react-native";

type Props = {};

const LocationBottomSheet = forwardRef<BottomSheet, Props>((props, ref) => {
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <View style={{ padding: 20 }}>
        <Text>Bottom Sheet Working 🎉</Text>
      </View>
    </BottomSheet>
  );
});

export default LocationBottomSheet;