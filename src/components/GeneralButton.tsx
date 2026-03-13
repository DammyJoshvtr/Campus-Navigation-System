import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  title: string;
  showIcon?: boolean;
}

const GeneralButton = ({ title, showIcon }: Props) => {
  return (
    <TouchableOpacity className="w-11/12 h-16 rounded-full overflow-hidden shadow-lg shadow-blue-500/40 active:opacity-80">
      <LinearGradient
        colors={["#38BDF8", "#2563EB"]} // Smooth transition from Sky Blue to Deep Blue
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        className="flex-1 justify-center items-center flex-row w-full h-full rounded-full"
      >
        <View className="flex-row items-center gap-x-2">
          <Text className="text-white text-[23px] font-bold">{title}</Text>
          {showIcon && <AntDesign name="arrow-right" size={20} color="white" />}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GeneralButton;

const styles = StyleSheet.create({});

// ============ PERSONAL NOTES ==============
//1️⃣ Sans-serif fonts (Best for maps & UI)

// Clean, modern, easy to read

// Works well on mobile screens

// Examples:

// Font	Use Case
// Roboto	Default for Android, very readable, professional
// Inter	Modern, good for headings and body text
// Poppins	Rounded, friendly feel, good for buttons
// Open Sans	Neutral, works well for body text

// ==============================================
