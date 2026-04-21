import GeneralButton from "@/components/GeneralButton";
import Searchbar from "@/components/Searchbar";
import useLocations from "@/hooks/getLocation";
import React, { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const Directions = () => {
  const inputRef = useRef<TextInput>(null);
  const secondInputRef = useRef<TextInput>(null);

  const [activeInput, setActiveInput] = useState("from");
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);

  const { coords = [] } = useLocations();
  const router = useRouter();

  // what user is typing
  const currentText = activeInput === "from" ? fromText : toText;

  const filteredLocations = coords.filter((item) =>
    item.name.toLowerCase().includes(currentText.toLowerCase()),
  );

  // 🔥 HANDLE SELECT LOCATION
  const handleDirection = (item: any) => {
    if (activeInput === "from") {
      setFromText(item.name);
      setFromLocation(item);
    } else {
      setToText(item.name);
      setToLocation(item);
    }

    setShowSearch(false);
  };

  // 🔥 HANDLE BUTTON CLICK
  const handleGetDirections = () => {
    if (!fromLocation || !toLocation) {
      console.log("Select both locations");
      return;
    }

    console.log(fromLocation, toLocation);

    router.push({
      pathname: "/home", // must match file route exactly
      params: {
        from: JSON.stringify(fromLocation),
        to: JSON.stringify(toLocation),
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eff6ff", padding: 16 }}>
      <View style={{ flex: 1, gap: 20 }}>
        {/* FROM */}
        <Searchbar
          ref={inputRef}
          barText="From"
          value={fromText}
          onChangeText={(text) => setFromText(text)}
          onFocus={() => {
            setActiveInput("from");
            setShowSearch(true);
          }}
        />

        {/* TO */}
        <Searchbar
          ref={secondInputRef}
          barText="To"
          value={toText}
          onChangeText={(text) => setToText(text)}
          onFocus={() => {
            setActiveInput("to");
            setShowSearch(true);
          }}
        />

        {/* DROPDOWN */}
        {showSearch && (
          <ScrollView
            style={[
              styles.searchContainer,
              activeInput === "from" ? { top: 70 } : { top: 140 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {filteredLocations.length > 0 ? (
              filteredLocations.map((item, index) => (
                <Pressable
                  key={index}
                  style={styles.resultItem}
                  onPress={() => handleDirection(item)} // ✅ FIXED
                >
                  <Text style={styles.resultText}>{item.name}</Text>
                </Pressable>
              ))
            ) : (
              <Text style={styles.noResult}>No Result Yet!</Text>
            )}
          </ScrollView>
        )}

        {/* BUTTON */}
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <GeneralButton
            title="Get Direction"
            showIcon={true}
            onPress={handleGetDirections} // ✅ FIXED
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Directions;

const styles = StyleSheet.create({
  searchContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    maxHeight: 250,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 1000,
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
