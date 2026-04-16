import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LocationBottomSheet from "@/components/LocationBottomSheet";

const profile = () => {
  return (
    <SafeAreaView className="flex-1">
      <LocationBottomSheet />
    </SafeAreaView>
  );
};

export default profile;

const styles = StyleSheet.create({});
