import Calendar from "@/components/Calendar";
import EventsCard from "@/components/EventsCard";
import { events } from "@/services/Events";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Events = () => {
  return (
    <SafeAreaView className="flex-1 bg-white px-4 gap-y-4">
      <Text className="text-center font-home-semibold text-[20px] mb-4">
        Events
      </Text>
      <Text className="font-home-semibold text-[20px]">January</Text>
      <Calendar />

      <View>
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
