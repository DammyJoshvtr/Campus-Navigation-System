import { Slot, usePathname } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icon } from "../../constant/icon";
import { image } from "../../constant/images";

const _layout = () => {
  const signin = () => {
    return (
      <View className="p-4 gap-4">
        <View className="flex-row gap-x-1 items-center">
          <Image
            source={icon.logo}
            resizeMode="contain"
            className=" w-14 h-14 "
          />

          <Text className="font-home-bold text-white text-[20px]">
            RUN MAPS
          </Text>
        </View>
        <Text className="font-home-bold text-[40px] text-white">
          Create your{"\n"}New Account
        </Text>
        <Text className="text-[16px] font-home-semibold text-gray-200  ">
          Join a smart navigation system app made for you
        </Text>
      </View>
    );
  };

  const validate = () => {
    return (
      <View className="p-4 gap-4">
        {/* Logo */}
        <View className="flex-row gap-x-1 items-center">
          <Image
            source={icon.logo}
            resizeMode="contain"
            className="w-14 h-14"
          />

          <Text className="font-home-bold text-white text-[20px]">
            RUN MAPS
          </Text>
        </View>

        {/* Heading */}
        <Text className="font-home-bold text-[40px] text-white">
          Verify your{"\n"}Email Address
        </Text>

        {/* Subheading */}
        <Text className="text-[16px] font-home-semibold text-gray-200">
          We sent a verification link to your email.{"\n"}
          Please check your inbox to continue.
        </Text>
      </View>
    );
  };

  const pathname = usePathname();

  const getHeading = () => {
    if (pathname.includes("signin")) {
      return signin();
    } else if (pathname.includes("verifyEmail")) {
      return validate();
    } else {
      return (
        <Text className="font-home-bold text-[24px] text-white p-4">
          Redeemer's University Map
        </Text>
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* 30% percent of screen */}
      <View className="h-[15%] w-full">{getHeading()}</View>

      {/* 70% Of screen */}
      <View className="h-[75%] rounded-t-[45px] bg-white/70 w-full overflow-hidden absolute bottom-0 p-8">
        <Image
          source={image.blur}
          resizeMode="cover"
          className="absolute left-0 bottom-10 w-[60rem] h-[60rem]"
        />
        <Image
          source={image.blur}
          resizeMode="cover"
          className="absolute right-0 top-0 w-[60rem] h-[60rem]"
        />
        <Slot />
      </View>
    </SafeAreaView>
  );
};

export default _layout;

const styles = StyleSheet.create({});
