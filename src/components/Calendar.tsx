import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Calendar = () => {
  const dates = [
    {
      day: "Sun",
      date: 1,
    },
    {
      day: "Mon",
      date: 2,
    },
    {
      day: "Tue",
      date: 3,
    },
    {
      day: "Wed",
      date: 4,
    },
    {
      day: "Thurs",
      date: 5,
    },
    {
      day: "Fri",
      date: 6,
    },
    {
      day: "Sat",
      date: 7,
    },
  ];

  return (
    <View style={styles.container}>
      <View className="flex flex-row justify-between">
        {dates.map((d, index) => (
          <View
            key={index}
            className={`${d.day === "Thurs" && "bg-[#2563EB] border-none"} gap-y-2 justify-center items-center rounded-full p-2  border-[1px] border-black w-16`}
          >
            <Text
              className={`${d.day === "Thurs" && "text-white"} font-home-medium text-[25px]`}
            >
              {d.date}
            </Text>
            <Text
              className={`${d.day === "Thurs" && "text-white"} font-home-medium text-sm`}
            >
              {d.day}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 80,
    rowGap: 10,
  },
});
