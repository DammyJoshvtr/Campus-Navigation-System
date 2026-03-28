import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const ScrollItems = () => {
  const items = [
    "Lecture Rooms",
    "Hostels",
    "Chapel",
    "Cafetarias",
    "Faculties",
  ];

  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 5 }}
    >
      <View className="flex-row gap-3">
        {items.map((item) => (
          <View
            key={item}
            className="p-3 min-w-24 bg-gray-100 rounded-full items-center elevation-sm"
          >
            <Text className="text-gray-400 font-medium">{item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ScrollItems;

const styles = StyleSheet.create({});
