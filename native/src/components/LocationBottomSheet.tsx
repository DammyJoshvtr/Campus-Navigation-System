import React, { useMemo, useRef, useEffect } from "react";
import { View, Text, Button } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

export default function LocationBottomSheet() {
  const sheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  useEffect(() => {
    // open automatically
    setTimeout(() => {
      sheetRef.current?.snapToIndex(0);
    }, 500);
  }, []);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1} // start CLOSED
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Bottom Sheet Working 🎉
        </Text>

        <Button
          title="Expand"
          onPress={() => sheetRef.current?.snapToIndex(1)}
        />

        <Button
          title="Close"
          onPress={() => sheetRef.current?.close()}
        />
      </View>
    </BottomSheet>
  );
}