import React from "react";
import { TextInput, View } from "react-native";

const Searchbar = ({ barText }: { barText: string }) => {
  return (
    <View className="h-14">
      <TextInput
        placeholder={barText}
        placeholderTextColor="#808080"
        className="h-full w-full rounded-full text-black bg-gray-100 px-5 text-[16px] elevation-lg"
      />
    </View>
  );
};

export default Searchbar;
