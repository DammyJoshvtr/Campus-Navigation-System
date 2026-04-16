import React, { useMemo, useRef } from "react";
import { View, Text } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

export default function LocationBottomSheet() {
  const sheetRef = useRef(null);

  const snapPoints = useMemo(() => ["25%", "50%", "80%"], []);

  return (
    <BottomSheet ref={sheetRef} index={0} snapPoints={snapPoints}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Locations</Text>

        <Text>Select a building or search above</Text>
      </View>
    </BottomSheet>
  );
}
