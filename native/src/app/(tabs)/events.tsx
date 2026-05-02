import WeekCalendar from "@/components/Calendar";
import EventsCard from "@/components/EventsCard";
import FAB from "@/components/fabs/EventFab";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Events = () => {
  const [date, setDate] = useState(new Date());
  const router = useRouter();
  const { theme } = useTheme();

  const [eventsData, setEventsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.getEvents();
      setEventsData(res.events || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

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

      <View className="flex-1 py-2">
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={eventsData}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => {
              return (
                <EventsCard
                  title={item.title}
                  description={item.description}
                  location={item.locationName}
                  date={item.date}
                  time={item.time}
                  status={item.status}
                  organizer={item.author}
                />
              );
            }}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => (
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 50 }}>
                No events found.
              </Text>
            )}
          />
        )}
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
