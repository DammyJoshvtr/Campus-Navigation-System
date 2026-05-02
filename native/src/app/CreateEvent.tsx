import { useTheme } from "@/context/ThemeContext";
import useLocations from "@/hooks/getLocation";
import api from "@/services/api";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CreateEvent = () => {
  const router = useRouter();
  const { coords } = useLocations();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [image, setImage] = useState<any>(null);
  const [author, setAuthor] = useState("");
  const { theme } = useTheme();

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!title || !location) {
      alert("Title and Location are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createEvent({
        title,
        description,
        locationName: location,
        date,
        time,
        status,
        image,
        author,
      });
      alert("Event Created!");
      router.back();
    } catch (error) {
      alert("Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
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
          placeholderTextColor={theme.textSecondary}
          value={title}
          onChangeText={setTitle}
          className="border border-gray-300 rounded-lg p-3 mb-3"
        />

        {/* Description */}
        <TextInput
          placeholder="Description"
          placeholderTextColor={theme.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          className="border border-gray-300 rounded-lg p-3 mb-3 h-24"
        />

        {/* Location Picker */}
        <TouchableOpacity
          onPress={() => setShowLocationPicker(true)}
          className="border border-gray-300 rounded-lg p-3 mb-3 bg-white"
        >
          <Text className={location ? "text-black" : "text-gray-400"}>
            {location ? location : "Select Location"}
          </Text>
        </TouchableOpacity>

        {/* Location Modal */}
        <Modal
          visible={showLocationPicker}
          animationType="slide"
          transparent={true}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-2xl max-h-[70%]">
              <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
                <Text className="text-lg font-bold">Select Location</Text>
                <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                  <Text className="text-blue-500 font-semibold">Close</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={coords}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="p-4 border-b border-gray-100"
                    onPress={() => {
                      setLocation(item.name);
                      setShowLocationPicker(false);
                    }}
                  >
                    <Text className="text-base">{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Date */}
        <TextInput
          placeholder="Date (e.g. May 25)"
          placeholderTextColor={theme.textSecondary}
          value={date}
          onChangeText={setDate}
          className="border border-gray-300 rounded-lg p-3 mb-3"
        />

        {/* Time */}
        <TextInput
          placeholder="Time (e.g. 2:00 PM)"
          placeholderTextColor={theme.textSecondary}
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
          placeholderTextColor={theme.textSecondary}
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
          disabled={isSubmitting}
          className="bg-blue-600 py-4 rounded-xl mb-10"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-white font-home-semibold text-lg">
              Create Event
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateEvent;
