import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
// import { use } from "@gorhom/bottom-sheet";

const Profile = () => {
  const sheetRef = useRef<BottomSheet | null>(null);

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const backdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={1}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  const openSheet = () => {
    console.log("Opening sheet...");
    sheetRef.current?.snapToIndex(2);
  };

  return (
    <View style={styles.container}>
      <Button title="Open Bottom Sheet" onPress={() => openSheet()} />

      <BottomSheet
        index={-1}
        snapPoints={snapPoints}
        ref={sheetRef}
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
