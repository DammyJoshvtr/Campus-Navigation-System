import { AntDesign } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabBarIcon = ({ focused, icon, name }: any) => {
  return (
    <View className="flex-col items-center justify-center w-44 h-16 gap-y-2 mt-6">
      <View
        className={`${focused && "bg-[#2563EB] w-20 h-7 "} rounded-full items-center justify-center`}
      >
        <AntDesign name={icon} size={focused ? 20 : 18} color="white" />
      </View>
      {focused && (
        <Text className="text-[14px] font-semibold text-[#2563EB] ml-2">
          {name}
        </Text>
      )}
    </View>
  );
};

const _layout = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 60,
          // backgroundColor: "#2563EB",
          backgroundColor: "gray",
          // shadowColor: "#000",
          // shadowOffset: { width: 0, height: 4 },
          // shadowOpacity: 0.15,
          // shadowRadius: 8,
          // elevation: 8,
          bottom: insets.bottom,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="Home" icon="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "events",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="Events" icon="user" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="Profile" icon="user" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;

// Expo
// react-native-maps
// OpenStreetMap tiles
// GeoJSON campus data
