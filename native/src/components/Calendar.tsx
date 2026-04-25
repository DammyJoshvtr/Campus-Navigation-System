import { addDays, format, getDate, isSameDay, startOfWeek } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  date: Date; // The currently selected date passed from the parent component
  onChange: (value: Date) => void; // Callback function to update the date in the parent
};

const WeekCalendar: React.FC<Props> = ({ date, onChange }) => {
  // State to hold the array of 7 days for the current week
  const [week, setWeek] = useState<WeekDay[]>([]);

  // Effect hook: Runs whenever the 'date' prop changes.
  // It recalculates the days of the week based on the new date.
  useEffect(() => {
    setWeek(getWeekDays(date));
  }, [date]);

  return (
    <View style={styles.container}>
      {/* Iterate through the calculated week days to render them */}
      {week.map((weekDay) => {
        // Check if this specific day is the one currently selected
        const isSelected = isSameDay(weekDay.date, date);

        // Define base styles for the container and text
        const containerStyles: ViewStyle[] = [styles.dayContainer];
        const textStyles: TextStyle[] = [styles.dayNumber];
        const labelStyles: TextStyle[] = [styles.dayLabel];

        // If this day is selected, apply the 'selected' styles (e.g., white background, black text)
        if (isSelected) {
          containerStyles.push(styles.selectedContainer);
          textStyles.push(styles.selectedText);
          labelStyles.push(styles.selectedText);
        }

        return (
          <TouchableOpacity
            key={weekDay.date.toISOString()} // Unique key for React list rendering
            style={containerStyles}
            onPress={() => onChange(weekDay.date)} // Update parent state on click
          >
            {/* Day Name (e.g., Mon, Tue) */}
            <Text style={labelStyles} className="font-home-semibold">
              {weekDay.formatted}
            </Text>
            {/* Day Number (e.g., 12, 13) */}
            <Text style={textStyles} className="font-home-semibold">
              {weekDay.day}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 15,
  },

  dayContainer: {
    width: 48,
    height: 60,
    borderRadius: 12, // rounded square
    alignItems: "center",
    justifyContent: "center",
  },

  selectedContainer: {
    backgroundColor: "white", // white
  },

  dayLabel: {
    fontSize: 12,
    color: "gray",
    marginBottom: 4,
  },

  dayNumber: {
    fontSize: 19,
    fontWeight: "600",
    color: "gray",
  },

  selectedText: {
    color: "#2563EB",
  },
});

type WeekDay = {
  formatted: string; // Day name (e.g., "Mon")
  date: Date; // Full Date object
  day: number; // Day of the month (e.g., 12)
};

// Helper function to generate the 7 days of the week containing the given date
export const getWeekDays = (date: Date): WeekDay[] => {
  // Find the start of the week (Monday) for the given date
  const start = startOfWeek(date, { weekStartsOn: 1 });

  const final: WeekDay[] = [];

  // Loop 7 times to generate each day of the week
  for (let i = 0; i < 7; i++) {
    const newDate = addDays(start, i); // Add 'i' days to the start date
    final.push({
      formatted: format(newDate, "EEE"), // Format as 3-letter day name (e.g., "Mon")
      date: newDate,
      day: getDate(newDate), // Get the day number
    });
  }

  return final;
};

export default WeekCalendar;
