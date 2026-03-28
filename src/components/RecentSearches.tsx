import React from "react";
import { ScrollView, Text, View } from "react-native";

const RecentSearches = () => {
  const searches = [
    {
      id: 1,
      from: "Lecture Room 5",
      to: "Prophet Moses Hall",
    },
    {
      id: 2,
      from: "Manna Palace Cafeteria",
      to: "Queen Esther Hall",
    },
    {
      id: 3,
      from: "Numbers Cafeteria",
      to: "Event Center",
    },
    {
      id: 4,
      from: "Engineering Hostel",
      to: "Main Field",
    },
  ];
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {searches.map((item) => (
        <View
          className="w-full  h-40 rounded-lg bg-gray-100 flex-col justify-between p-4  mb-6"
          key={item.id}
        >
          <View className="bg-white w-full p-4 rounded-md">
            <Text className="font-home-medium text-gray-700">
              From: {item.from}
            </Text>
          </View>

          <View className="bg-white w-full p-4 rounded-md">
            <Text className="font-home-medium text-gray-700">
              To: {item.to}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default RecentSearches;
