import GeneralButton from "@/components/GeneralButton";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VerifyEmail = () => {
  return (
    <SafeAreaView className="flex-1 justify-between">
      {/* Top Section */}
      <View className="items-center mt-16 px-6 gap-y-6">
        <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center">
          <AntDesign name="mail" size={40} color="#2563EB" />
        </View>

        <Text className="text-[26px] font-home-bold text-gray-900 text-center">
          Verify your email
        </Text>

        <Text className="text-gray-500 text-center text-[15px] font-home-regular leading-6">
          We've sent a verification link to your email address. Please check
          your inbox and click the link to activate your account.
        </Text>

        <View className="bg-gray-100 px-4 py-3 rounded-xl">
          <Text className="font-home-semibold text-gray-700">
            johndoe@email.com
          </Text>
        </View>
      </View>

      {/* Bottom Actions */}
      <View className="px-6 mb-8 gap-y-6">
        <View className="items-center">
          <GeneralButton title="I've Verified My Email" showIcon />
        </View>

        <View className="flex-row justify-center">
          <Text className="text-gray-500 font-home-regular">
            Didn't receive the email?
          </Text>

          <Pressable>
            <Text className="text-primary font-home-semibold ml-2">Resend</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VerifyEmail;
