import React from "react";
import { TextInput, View } from "react-native";

const Searchbar = () => {
  return (
    <View className="h-14">
      <TextInput
        placeholder="Search"
        placeholderTextColor="#808080"
        className="h-full w-full rounded-full text-black bg-white px-5 text-[16px] elevation-sm"
      />
    </View>
  );
};

export default Searchbar;
