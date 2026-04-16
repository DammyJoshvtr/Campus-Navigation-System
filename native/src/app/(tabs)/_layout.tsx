import { Tabs } from "expo-router";
import { CalendarDays, House, UserRound } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const TabBarIcon = ({ focused, name, icon }: any) => {
  return (
    <View className="flex-col items-center justify-center w-44 h-20 mt-6 bg-white">
      <View
        className={`${focused && "bg-[#2563EB]/80 w-20 h-10"} rounded-full items-center justify-center`}
      >
        {icon}
      </View>
      <Text
        className={`text-[14px] font-semibold ml-2 ${
          focused ? "text-[#2563EB]" : "text-[#6b7280]"
        }`}
      >
        {name}
      </Text>
    </View>
  );
};

const _layout = () => {
  const insets = useSafeAreaInsets();
  return (
    <GestureHandlerRootView className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 60,
            // backgroundColor: "#2563EB",
            backgroundColor: "white",
            // shadowColor: "#000",
            // shadowOffset: { width: 0, height: 4 },
            // shadowOpacity: 0.15,
            // shadowRadius: 8,
            // elevation: 8,
            bottom: insets.bottom,
          },
          // tabBarItemStyle: {
          //   flex: 1,
          //   justifyContent: "center",
          //   alignItems: "center",
          // },
          animation: "shift",
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                name="Home"
                icon={
                  <House size={25} color={`${focused ? "white" : "#6b7280"}`} />
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: "events",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                name="Events"
                icon={
                  <CalendarDays
                    size={25}
                    color={`${focused ? "white" : "#6b7280"}`}
                  />
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                name="Profile"
                icon={
                  <UserRound
                    size={25}
                    color={`${focused ? "white" : "#6b7280"}`}
                  />
                }
              />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
};

export default _layout;

// Expo
// react-native-maps
// OpenStreetMap tiles
// GeoJSON campus data
