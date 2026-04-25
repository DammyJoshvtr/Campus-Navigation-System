import WeekCalendar from "@/components/Calendar";
import EventsCard from "@/components/EventsCard";
import FAB from "@/components/fabs/EventFab";
import { events } from "@/services/Events";
import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Events = () => {
  const [date, setDate] = useState(new Date());
  return (
    <SafeAreaView className="flex-1 px-4 gap-y-4 bg-blue-50">
      <StatusBar backgroundColor={"black"} />
      <View className="min-h-9">
        <Text className="text-center font-home-semibold text-[20px] mb-4">
          Upcoming Events
        </Text>
      </View>
      <Text className="font-home-medium text-[18px]">May</Text>

      <WeekCalendar date={date} onChange={(newDate) => setDate(newDate)} />

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
                organizer={item.organizer}
              />
            );
          }}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      <TouchableOpacity
        hitSlop={10}
        onPress={() => {}}
        style={{ position: "absolute", bottom: 80, right: 30, gap: 5 }}>
        <FAB />
        <Text className="text-home-regular text-gray-700">Create Event</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Events;

const styles = StyleSheet.create({});
