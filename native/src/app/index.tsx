import GeneralButton from "@/components/GeneralButton";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { image } from "../constant/images";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Index() {
  return (
    <View className="flex-1">
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
        </View>

        <Link href="/signin" asChild>
          <GeneralButton title="Get Started" showIcon={true} />
        </Link>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
