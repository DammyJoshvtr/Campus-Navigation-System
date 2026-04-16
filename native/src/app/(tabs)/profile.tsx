import React, { useRef } from "react";
import { View, Text, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import LocationBottomSheet from "@/components/LocationBottomSheet";

export default function Profile() {
  const sheetRef = useRef<BottomSheet>(null);

  const openSheet = () => {
    console.log("Opening sheet...");
    sheetRef.current?.snapToIndex(0);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Profile Screen</Text>
        <Button title="Open Sheet" onPress={openSheet} />
      </View>

      {/* IMPORTANT: MUST be inside same screen */}
      <LocationBottomSheet ref={sheetRef} />
    </SafeAreaView>
  );
}