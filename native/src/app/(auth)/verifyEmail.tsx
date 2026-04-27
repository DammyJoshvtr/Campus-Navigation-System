import api from "@/services/api";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleAlert } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GeneralButton from "../../components/GeneralButton";

const VerifyEmail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params?.email as string) || "user@email.com";
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async () => {
    setErrorMsg(null);

    if (otp.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      await api.authVerifyOtp(email, otp);
      router.replace("/home");
    } catch (err: any) {
      console.log("Verify Error Details: ", err.response?.data || err.message);
      
      if (err.response?.status === 400) {
        setErrorMsg(err.response?.data?.message || "Invalid or expired OTP.");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMsg(null);
    setIsResending(true);
    try {
      await api.authResendOtp(email);
      Alert.alert("Success", "A new OTP has been sent to your email.");
    } catch (err: any) {
      console.log("Resend Error Details: ", err.response?.data || err.message);
      setErrorMsg(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-between">
      {/* Top Section */}
      <View className="items-center mt-12 px-6 gap-y-6">
        <View 
          className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-full items-center justify-center"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
        >
          <AntDesign name="mail" size={36} color="#2563EB" />
        </View>

        <Text className="text-[26px] font-home-bold text-gray-900 text-center">
          Verify your email
        </Text>

        <Text className="text-gray-500 text-center text-[15px] font-home-regular leading-6">
          We've sent a 6-digit verification code to your email address. Please enter it below to activate your account.
        </Text>

        <View 
          className="bg-gray-50 border border-gray-200 px-5 py-3 rounded-xl mb-2"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
        >
          <Text className="font-home-semibold text-gray-700 text-[15px]">
            {email}
          </Text>
        </View>

        {/* Error UI */}
        {errorMsg && (
          <View className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex-row items-center gap-x-3 mb-2">
            <CircleAlert size={20} color="#EF4444" />
            <Text className="text-red-600 font-home-medium text-[14px] flex-1">
              {errorMsg}
            </Text>
          </View>
        )}

        {/* OTP Input Field */}
        <View className="w-full">
          <TextInput
            className={`w-full h-16 bg-white border ${errorMsg ? 'border-red-400' : 'border-gray-300'} rounded-xl px-4 text-center text-gray-800 font-home-bold`}
            style={{ fontSize: 26, letterSpacing: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
            placeholder="••••••"
            placeholderTextColor="#D1D5DB"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(text) => {
              setOtp(text.replace(/[^0-9]/g, ''));
              if (errorMsg) setErrorMsg(null);
            }}
            editable={!isLoading && !isResending}
          />
        </View>
      </View>

      {/* Bottom Actions */}
      <View className="px-6 mb-8 gap-y-6">
        <View className="items-center w-full">
          {isLoading ? (
            <View 
              className="w-full h-14 bg-primary rounded-xl items-center justify-center"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
            >
              <ActivityIndicator color="white" size="small" />
            </View>
          ) : (
            <GeneralButton title="Verify Account" showIcon={false} onPress={handleVerify} />
          )}
        </View>

        <View className="flex-row justify-center mt-2 items-center">
          <Text className="text-gray-500 font-home-medium text-[15px]">
            Didn't receive the email?
          </Text>

          <Pressable className="ml-2" disabled={isLoading || isResending} onPress={handleResend}>
            {isResending ? (
               <ActivityIndicator color="#2563EB" size="small" />
            ) : (
               <Text className="text-primary font-home-bold text-[15px]">Resend OTP</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VerifyEmail;
