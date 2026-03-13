import GeneralButton from "@/components/GeneralButton";
import { Image, StyleSheet, View } from "react-native";
import { image } from "../constant/images";

export default function Index() {
  return (
    <View className="flex-1">
      <Image
        source={image.background}
        resizeMode="cover"
        className="absolute w-full h-full"
      />
      <View className="absolute bottom-20 w-full justify-center items-center px-4">
        <GeneralButton title="Get Started" showIcon={false} />
      </View>
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
