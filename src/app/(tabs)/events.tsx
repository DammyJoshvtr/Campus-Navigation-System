import Calendar from "@/components/Calendar";
import EventsCard from "@/components/EventsCard";
import { events } from "@/services/Events";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Events = () => {
  return (
    <SafeAreaView className="flex-1 px-4 gap-y-4 bg-blue-50">
      <StatusBar backgroundColor={"black"} />
      <View className="min-h-9">
        <View className="absolute bg-black w-11 h-11 rounded-full items-center justify-center">
          <ArrowLeft color="white" />
        </View>
        <Text className="text-center font-home-semibold text-[20px] mb-4">
          Upcoming Events
        </Text>
      </View>
      <Text className="font-home-medium text-[18px]">January</Text>
      <Calendar />

      <View className="py-2">
        <FlatList
          showsHorizontalScrollIndicator={false}
          data={events}
          renderItem={({ item }) => {
            return (
              <EventsCard
                title={item.title}
                description={item.description}
                location={item.locationName}
                date={item.date}
                time={item.time}
                status={item.status}
                category={item.category}
                organizer={item.organizer}
              />
            );
          }}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </SafeAreaView>
  );
};

export default Events;

const styles = StyleSheet.create({});
