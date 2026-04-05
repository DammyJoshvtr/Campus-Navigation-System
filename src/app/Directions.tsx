import Searchbar from "@/components/Searchbar";
import useLocations from "@/hooks/getLocation";
import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Directions = () => {
  const inputRef = useRef<TextInput>(null);
  const secondInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [searchText, setSearchText] = useState(""); //State for onChange Text...
  const [showSearch, setShowSearch] = useState(false);

  const { coords = [], loading } = useLocations();

  useEffect(() => {
    inputRef.current?.focus();
    setShowSearch(true);
  }, [inputRef]);

  useEffect(() => {
    secondInputRef.current?.focus();
    setShowSearch(true);
  }, [secondInputRef]);

  const handleSearch = () => {
    setShowSearch(true);
  };

  const filteredLocations = coords.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-blue-50 px-4 gap-y-4">
      <TouchableWithoutFeedback onPress={() => setShowSearch(false)}>
        <View className="flex-1 gap-y-6">
          <Pressable onPress={() => handleSearch()}>
            <Searchbar
              ref={inputRef}
              barText="From"
              onChangeText={(text) => setSearchText(text)}
            />
          </Pressable>

          <Pressable onPress={handleSearch}>
            <Searchbar
              barText="To"
              onChangeText={(text) => setSearchText(text)}
            />
          </Pressable>

          {/* <ScrollView style={styles.searchContainer}> */}
          {showSearch && (
            <ScrollView
              style={styles.searchContainer}
              keyboardShouldPersistTaps="handled"
            >
              {filteredLocations.length > 0 ? (
                filteredLocations.map((item, index) => (
                  <Pressable key={index} style={styles.resultItem}>
                    <Text style={styles.resultText}>{item.name}</Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.noResult}>No Result Yet!</Text>
              )}
            </ScrollView>
          )}
          {/* </ScrollView> */}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default Directions;

const styles = StyleSheet.create({
  searchContainer: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    maxHeight: 250,

    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 8,

    elevation: 8, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  resultText: {
    fontSize: 16,
    color: "#333",
  },

  noResult: {
    padding: 16,
    textAlign: "center",
    color: "#888",
  },
});
