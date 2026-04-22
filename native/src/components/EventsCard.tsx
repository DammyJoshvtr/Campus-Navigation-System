import { ArrowUpRight, MapPin } from "lucide-react-native";
import React from "react";
import { Image, Text, View } from "react-native";

interface Props {
  title: String;
  description: String;
  location: String;
  date: String;
  time: String;
  status: String;
  image?: any;
  organizer: String;
}

const EventsCard = ({
  title,
  description,
  location,
  date,
  time,
  status,
  image,
  organizer,
}: Props) => {
  return (
    <View className="w-full flex-row bg-white rounded-xl p-3 mb-3 shadow-md elevation-2">
      {/* Image */}
      <View className="w-[30%] h-24 rounded-lg overflow-hidden bg-gray-200 justify-center items-center">
        {image ? (
          <Image source={{ uri: image }} className="w-full h-full" />
        ) : (
          <Text className="text-gray-500 text-xs">No Image</Text>
        )}
      </View>

      {/* Content */}
      <View className="w-[70%] pl-3 justify-between">
        {/* Top section */}
        <View className="flex-row justify-between">
          <Text className="text-base font-home-bold text-gray-900">
            {title}
          </Text>

          <View className="bg-gray-100 w-9 h-9 rounded-full justify-center items-center">
            <ArrowUpRight color="#2563EB" />
          </View>
        </View>

        {/* Middle */}

        <View className="mt-1">
          <Text className="text-xs text-gray-600 font-home-semibold">
            {description}
          </Text>
          <Text className="text-xs text-gray-600 font-home-medium">
            {date} • {time}
          </Text>
        </View>

        {/* Bottom */}
        <View className="flex-row items-center justify-between mt-2">
          {/* Status Badge */}
          <View
            className={`px-2 py-1 rounded-full ${
              status === "ongoing"
                ? "bg-green-100"
                : status === "upcoming"
                  ? "bg-blue-100"
                  : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-xs font-home-medium  ${
                status === "ongoing"
                  ? "text-green-700"
                  : status === "upcoming"
                    ? "text-blue-700"
                    : "text-gray-600"
              }`}
            >
              {status}
            </Text>
          </View>

          {/* Location */}
          <View className="flex-row items-center justify-center gap-x-1">
            <MapPin color="gray" size={15} />
            <Text className="text-xs text-gray-500 mt-1 font-home-medium">
              {location}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default EventsCard;
