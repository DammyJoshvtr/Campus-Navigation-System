import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

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
        <Text className="text-white text-lg font-bold">{title}</Text>
        {showIcon && <Text className="text-white ml-2">icon</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GeneralButton;

const styles = StyleSheet.create({});
