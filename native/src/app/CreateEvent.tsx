import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

const CreateEvent = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [image, setImage] = useState<any>(null);
  const [author, setAuthor] = useState("");

  // pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    const newEvent = {
      title,
      description,
      location,
      date,
      time,
      status,
      image,
      author,
    };

    console.log("Event Created:", newEvent);

    // later → send to backend
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-home-bold text-center mt-2 mb-6">
          Create Event
        </Text>

        {/* Title */}
        <TextInput
          placeholder="Event Title"
          value={title}
          onChangeText={setTitle}
          className="border border-gray-300 rounded-lg p-3 mb-3"
        />

        {/* Description */}
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          className="border border-gray-300 rounded-lg p-3 mb-3 h-24"
        />

        {/* Location */}
        <TextInput
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          className="border border-gray-300 rounded-lg p-3 mb-3"
        />

        {/* Date */}
        <TextInput
          placeholder="Date (e.g. May 25)"
          value={date}
          onChangeText={setDate}
          className="border border-gray-300 rounded-lg p-3 mb-3"
        />

        {/* Time */}
        <TextInput
          placeholder="Time (e.g. 2:00 PM)"
          value={time}
          onChangeText={setTime}
          className="border border-gray-300 rounded-lg p-3 mb-3"
        />

        {/* Status */}
        <View className="flex-row justify-between mb-4">
          {["upcoming", "ongoing", "ended"].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              className={`px-4 py-2 rounded-full ${
                status === s ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-sm ${
                  status === s ? "text-white" : "text-gray-700"
                }`}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Author */}
        <TextInput
          placeholder="Organizer / Author"
          value={author}
          onChangeText={setAuthor}
          className="border border-gray-300 rounded-lg p-3 mb-3"
        />

        {/* Image Picker */}
        <TouchableOpacity
          onPress={pickImage}
          className="border border-dashed border-gray-400 rounded-lg p-4 items-center mb-4"
        >
          <Text className="text-gray-500">Tap to select image</Text>
        </TouchableOpacity>

        {image && (
          <Image
            source={{ uri: image }}
            className="w-full h-40 rounded-lg mb-4"
          />
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-blue-600 py-4 rounded-xl mb-10"
        >
          <Text className="text-center text-white font-home-semibold text-lg">
            Create Event
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateEvent;