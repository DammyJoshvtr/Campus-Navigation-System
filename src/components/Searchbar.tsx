import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

const Searchbar = () => {
  return (
    <View>
      <TextInput
        placeholder="Search"
        placeholderTextColor="#808080"
        className="h-full w-full rounded-full text-black bg-white px-4 text-[16px]"
      />
    </View>
  );
};

export default Searchbar;

const styles = StyleSheet.create({});
