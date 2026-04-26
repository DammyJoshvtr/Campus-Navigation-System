import WeekCalendar from "@/components/Calendar";
import EventsCard from "@/components/EventsCard";
import FAB from "@/components/fabs/EventFab";
import { useTheme } from "@/context/ThemeContext";
import { events } from "@/services/Events";
import { useRouter } from "expo-router";
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
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{ backgroundColor: theme.bg }}
      className="flex-1 px-4 gap-y-4"
    >
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <View className="min-h-9">
        <Text
          style={{ color: theme.text }}
          className="text-center font-home-semibold text-[20px] mb-4"
        >
          Upcoming Events
        </Text>
      </View>
      <Text
        style={{ color: theme.textSecondary }}
        className="font-home-medium text-[18px]"
      >
        May
      </Text>

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
        onPress={() => router.push("/CreateEvent")}
        style={{ position: "absolute", bottom: 20, right: 30, gap: 5 }}
      >
        <FAB />
        <Text style={{ color: theme.primary }} className="text-home-regular">
          Create Event
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Events;

const styles = StyleSheet.create({});
