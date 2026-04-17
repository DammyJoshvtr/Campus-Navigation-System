import React, { useMemo, useRef } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

const Profile = () => {
  const sheetRef = useRef<BottomSheet | null>(null);

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const openSheet = () => {
    console.log("Opening sheet...");
    sheetRef.current?.snapToIndex(0);
  };

  return (
    <View style={styles.container}>
      <Button title="Open Bottom Sheet" onPress={() => openSheet()} />

      <BottomSheet index={1} snapPoints={snapPoints} ref={sheetRef}>
        <View style={{ padding: 20 }} className="bg-black rounded-t-3xl">
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Bottom Sheet Works 🎉
          </Text>
        </View>
      </BottomSheet>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
  },
});
