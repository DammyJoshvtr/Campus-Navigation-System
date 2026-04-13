import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BasicBottomSheetExample from "../../components/BasicBottomSheetExample";

const profile = () => {
  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <BasicBottomSheetExample />
    </SafeAreaView>
  );
};

export default profile;

const styles = StyleSheet.create({});
