import GeneralButton from "@/components/GeneralButton";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { image } from "../constant/images";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkLoginState = async () => {
      try {
        const session = await AsyncStorage.getItem("@campus_session");
        const token = await AsyncStorage.getItem("@campus_token");
        if (session === "true" && token) {
          router.replace("/home");
        } else {
          setIsChecking(false);
        }
      } catch (e) {
        console.log("Failed to check session", e);
        setIsChecking(false);
      }
    };
    checkLoginState();
  }, []);

  if (isChecking) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
      {/* 1. Background Image (Bottom Layer) */}
      <Image
        source={image.background}
        resizeMode="cover"
        className="absolute w-full h-full"
      />

      {/* 2. Soft Dark Gradient Overlay (Middle Layer) */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        className="absolute bottom-0 w-full h-1/2"
      />

      {/* 3. Content Container (Top Layer) */}
      <SafeAreaView className="flex-1 justify-end items-center px-4 pb-10 gap-y-5">
        <View className="pl-4 flex w-full">
          <Text className="text-5xl text-white font-bold font-home-bold leading">
            Redemer's University{"\n"}Maps
          </Text>
          <Text
            className="font-home-medium text-gray-300 text-xl mt-2"
            numberOfLines={2}
          >
            Your guide to seamless movement around campus
          </Text>
        </View>

        <Link href="/signin" asChild>
          <GeneralButton title="Get Started" showIcon={true} />
        </Link>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
