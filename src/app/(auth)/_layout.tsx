import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
// import { Stack }

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
};

export default _layout;

const styles = StyleSheet.create({});
