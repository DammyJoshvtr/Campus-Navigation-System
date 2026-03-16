import { AntDesign } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const TabBarIcon = ({ focused, icon, name }: any) => {
  return (
    <View
      className={`flex-row items-center justify-center w-44 h-20 mt-6 ${
        focused ? "bg-white/50 px-5 py-2 rounded-full w-52" : ""
      }`}
    >
      <AntDesign
        name={icon}
        size={focused ? 20 : 18}
        color={focused ? "#2563EB" : "white"}
      />
      {focused && (
        <Text className="text-[14px] font-semibold text-[#2563EB] ml-2">
          {name}
        </Text>
      )}
    </View>
  );
};

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 32,
          marginHorizontal: 30,
          height: 60,
          backgroundColor: "#2563EB",
          borderRadius: 35,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
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
