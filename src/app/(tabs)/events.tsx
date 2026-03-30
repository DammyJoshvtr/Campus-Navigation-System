import Calendar from "@/components/Calendar";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Events = () => {
  
  return (
    <SafeAreaView className="flex-1 bg-white px-4 gap-y-4">
      <Text className="text-center font-home-bold text-[20px] mb-4">
        Events
      </Text>
      <Text className="font-home-bold font-lg">January</Text>
      <Calendar />
    </SafeAreaView>
  );
};

export default Events;

const styles = StyleSheet.create({});
