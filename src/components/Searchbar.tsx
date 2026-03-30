import React, { forwardRef } from "react";
import { TextInput, View } from "react-native";

const Searchbar = forwardRef<
  TextInput,
  { barText: string; onFocus?: () => void }
>(({ barText, onFocus }, ref) => {
  return (
    <View className="h-14">
      <TextInput
        ref={ref}
        placeholder={barText}
        placeholderTextColor="#808080"
        className="h-full w-full rounded-full text-black bg-gray-100 px-5 text-[16px] elevation-lg"
        onFocus={onFocus}
      />
    </View>
  );
});

export default Searchbar;
