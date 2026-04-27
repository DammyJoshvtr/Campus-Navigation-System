import { useTheme } from "@/context/ThemeContext";
import { Tabs } from "expo-router";
import { CalendarDays, House, UserRound } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Tab Icon Component ─────────────────────────────

const TabBarIcon = ({ focused, name, icon, theme }: any) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        backgroundColor: "red",
      }}
    >
      {/* Icon background */}
      <View
        style={{
          backgroundColor: focused ? theme.primary : "transparent",
          width: 80,
          height: 40,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
      </View>

      {/* Label */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: focused ? theme.primary : theme.textMuted,
          marginTop: 4,
        }}
      >
        {name}
      </Text>
    </View>
  );
};

// ─── Layout ─────────────────────────────────────────

const Layout = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "blue",
          },
          tabBarStyle: {
            height: 90 + insets.bottom,
            paddingBottom: insets.bottom,
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          },
        }}
      >
        {/* ── HOME ── */}
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                name="Home"
                theme={theme}
                icon={
                  <House
                    size={24}
                    color={focused ? theme.primaryFg : theme.textMuted}
                  />
                }
              />
            ),
          }}
        />

        {/* ── EVENTS ── */}
        <Tabs.Screen
          name="events"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                name="Events"
                theme={theme}
                icon={
                  <CalendarDays
                    size={24}
                    color={focused ? theme.primaryFg : theme.textMuted}
                  />
                }
              />
            ),
          }}
        />

        {/* ── PROFILE ── */}
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                name="Profile"
                theme={theme}
                icon={
                  <UserRound
                    size={24}
                    color={focused ? theme.primaryFg : theme.textMuted}
                  />
                }
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

export default Layout;
