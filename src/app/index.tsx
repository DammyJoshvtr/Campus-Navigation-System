import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { image } from "../constant/images";

export default function Index() {
  return (
    <View className="flex-1">
      <Image
        source={image.background}
        resizeMode="cover"
        className="absolute w-full h-full"
      />
      <SafeAreaView className="flex-1">
        {/* Place your login/welcome content here */}
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
