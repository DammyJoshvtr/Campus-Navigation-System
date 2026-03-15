import GeneralButton from "@/components/GeneralButton";
import { icon } from "@/constant/icon";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Signin = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("signup"); // State to handle Login and Signin UI

  const handleSignup = () => {
    setActiveTab("signup");
  };

  const handleSignin = () => {
    setActiveTab("signin");
  };

  const handleButtonPress = () => {
    if (activeTab === "signup") {
      router.push("/verifyEmail");
    } else {
      router.replace("../index");
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-between">
      {/* Top Section */}
      <View className="gap-y-8">
        {/* Tabs */}
        <View className="w-full items-center">
          <View className="flex-row bg-gray-100 rounded-full p-1 w-[85%] h-12 shadow-sm">
            {/* Signup Tab */}
            <Pressable
              onPress={handleSignup}
              className={`flex-1 rounded-full justify-center items-center ${
                activeTab === "signup" ? "bg-primary" : ""
              }`}
            >
              <Text
                className={`font-home-semibold text-[15px] ${
                  activeTab === "signup" ? "text-white" : "text-gray-500"
                }`}
              >
                Signup
              </Text>
            </Pressable>

            {/* Signin Tab */}
            <Pressable
              onPress={handleSignin}
              className={`flex-1 rounded-full justify-center items-center ${
                activeTab === "signin" ? "bg-primary" : ""
              }`}
            >
              <Text
                className={`font-home-semibold text-[15px] ${
                  activeTab === "signin" ? "text-white" : "text-gray-500"
                }`}
              >
                Signin
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Form */}
        <View className="gap-y-5">
          {/* Show Full Name only on Signup */}
          {activeTab === "signup" && (
            <View>
              <Text className="mb-2 text-[13px] text-gray-600 font-home-semibold">
                Full Name
              </Text>

              <TextInput
                className="h-14 rounded-xl bg-white border border-gray-200 px-4 text-[15px] font-home-medium text-gray-800"
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          )}

          {/* Email */}
          <View>
            <Text className="mb-2 text-[13px] text-gray-600 font-home-semibold">
              Email Address
            </Text>

            <TextInput
              className="h-14 rounded-xl bg-white border border-gray-200 px-4 text-[15px] font-home-medium text-gray-800"
              placeholder="johndoe@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View>
            <Text className="mb-2 text-[13px] text-gray-600 font-home-semibold">
              Password
            </Text>

            <TextInput
              className="h-14 rounded-xl bg-white border border-gray-200 px-4 text-[15px] font-home-medium text-gray-800"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>
        </View>

        {/* Button */}
        <View className="mt-2 flex justify-center items-center">
          <GeneralButton
            title={activeTab === "signup" ? "Create Account" : "Sign In"}
            showIcon={false}
            onPress={handleButtonPress}
          />
        </View>
      </View>

      {/* Bottom Section */}
      <View className="gap-y-6">
        {/* Divider */}
        <View className="flex-row items-center">
          <View className="flex-1 h-[1px] bg-gray-200" />

          <Text className="mx-4 text-gray-500 text-[13px] font-home-regular">
            Or continue with
          </Text>

          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        {/* Google Button */}
        <Pressable className="h-14 flex-row items-center justify-center gap-x-3 bg-white border border-gray-200 rounded-xl shadow-sm">
          <Image
            source={icon.google}
            resizeMode="contain"
            className="w-5 h-5"
          />

          <Text className="font-home-semibold text-[15px] text-gray-700">
            Continue with Google
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Signin;
