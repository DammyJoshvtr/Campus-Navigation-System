import RecentSearches from "@/components/RecentSearches";
import ScrollItems from "@/components/ScrollItems";
import Searchbar from "@/components/Searchbar";
import React, { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Directions = () => {
  const inputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-blue-50 px-4 gap-y-4">
      <View className="gap-y-6">
        <Searchbar ref={inputRef} barText="From" />
        <Searchbar barText="To" />
      </View>

      <View className="gap-y-4">
        <Text className="font-home-medium text-gray-700">Recommended</Text>
        <ScrollItems />
      </View>

      <View className="gap-y-4">
        <Text className="font-home-medium text-gray-700">Recent Searches</Text>
        <RecentSearches />
      </View>
    </SafeAreaView>
  );
};

export default Directions;

const styles = StyleSheet.create({});
