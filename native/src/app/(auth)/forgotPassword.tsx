import api from "@/services/api";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { CircleAlert, Eye, EyeOff, CheckCircle } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, Alert, KeyboardAvoidingView, ScrollView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GeneralButton from "../../components/GeneralButton";

const ForgotPassword = () => {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify & Reset Password

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRequestOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    Keyboard.dismiss();

    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!email.toLowerCase().endsWith("@run.edu.ng")) {
      setErrorMsg("Please use your school email (@run.edu.ng).");
      return;
    }

    setIsLoading(true);
    try {
      await api.authForgotPassword(email);
      setSuccessMsg("Reset code sent! Please check your email inbox.");
      setStep(2);
    } catch (err: any) {
      console.log("Forgot Password Request Error: ", err.response?.data || err.message);
      if (err.response?.status === 404) {
        setErrorMsg("No account found with this email.");
      } else {
        setErrorMsg("Failed to send reset code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    Keyboard.dismiss();

    if (otp.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit code.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await api.authResetPassword(email, otp, { password });
      Alert.alert(
        "Success",
        "Your password has been reset successfully. Please sign in with your new password.",
        [{ text: "OK", onPress: () => router.replace("/signin") }]
      );
    } catch (err: any) {
      console.log("Reset Password Verify Error: ", err.response?.data || err.message);
      if (err.response?.status === 400) {
        setErrorMsg(err.response?.data?.message || "Invalid or expired reset code.");
      } else {
        setErrorMsg("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top Section */}
            <View className="items-center mt-10 px-6 gap-y-6">
              {/* Icon */}
              <View 
                className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-full items-center justify-center"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
              >
                <AntDesign name="lock" size={38} color="#2563EB" />
              </View>

              <Text className="text-[26px] font-home-bold text-gray-900 text-center">
                {step === 1 ? "Forgot Password" : "Reset Password"}
              </Text>

              <Text className="text-gray-500 text-center text-[15px] font-home-regular leading-6">
                {step === 1 
                  ? "Enter your registered school email address below and we'll send you a 6-digit code to reset your password."
                  : "We've sent a 6-digit code to your email. Enter the code and your new secure password below."
                }
              </Text>

              {/* Status Messages */}
              {errorMsg && (
                <View className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex-row items-center gap-x-3">
                  <CircleAlert size={20} color="#EF4444" />
                  <Text className="text-red-600 font-home-medium text-[14px] flex-1">
                    {errorMsg}
                  </Text>
                </View>
              )}

              {successMsg && (
                <View className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex-row items-center gap-x-3">
                  <CheckCircle size={20} color="#10B981" />
                  <Text className="text-emerald-700 font-home-medium text-[14px] flex-1">
                    {successMsg}
                  </Text>
                </View>
              )}

              {/* Form Input fields */}
              {step === 1 ? (
                /* Step 1: Request OTP Form */
                <View className="w-full gap-y-1">
                  <Text className="mb-2 text-[14px] text-gray-600 font-home-semibold">
                    Email Address
                  </Text>
                  <TextInput
                    className="w-full h-14 rounded-xl bg-gray-50 border border-gray-200 px-4 text-[15px] font-home-medium text-gray-800"
                    placeholder="student@run.edu.ng"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    editable={!isLoading}
                  />
                </View>
              ) : (
                /* Step 2: Reset Form */
                <View className="w-full gap-y-4">
                  {/* OTP Code input */}
                  <View>
                    <Text className="mb-2 text-[14px] text-gray-600 font-home-semibold">
                      6-Digit Reset Code
                    </Text>
                    <TextInput
                      className="w-full h-14 rounded-xl bg-gray-50 border border-gray-200 px-4 text-[16px] font-home-bold text-gray-800 text-center"
                      style={{ letterSpacing: 8 }}
                      placeholder="••••••"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otp}
                      onChangeText={(text) => {
                        setOtp(text.replace(/[^0-9]/g, ''));
                        if (errorMsg) setErrorMsg(null);
                      }}
                      editable={!isLoading}
                    />
                  </View>

                  {/* New Password input */}
                  <View>
                    <Text className="mb-2 text-[14px] text-gray-600 font-home-semibold">
                      New Password
                    </Text>
                    <View className="relative justify-center">
                      <TextInput
                        className="h-14 rounded-xl bg-gray-50 border border-gray-200 pl-4 pr-14 text-[15px] font-home-medium text-gray-800"
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        editable={!isLoading}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-4 p-1"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="#9CA3AF" />
                        ) : (
                          <Eye size={20} color="#9CA3AF" />
                        )}
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Bottom Actions */}
            <View className="px-6 mt-8 gap-y-4">
              <View className="items-center w-full">
                {isLoading ? (
                  <View 
                    className="w-full h-14 bg-primary rounded-xl items-center justify-center"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
                  >
                    <ActivityIndicator color="white" size="small" />
                  </View>
                ) : (
                  <GeneralButton 
                    title={step === 1 ? "Send Reset Code" : "Reset Password"} 
                    showIcon={false} 
                    onPress={step === 1 ? handleRequestOtp : handleResetPassword} 
                  />
                )}
              </View>

              <Pressable 
                onPress={() => {
                  if (step === 2) {
                    setStep(1);
                  } else {
                    router.back();
                  }
                }}
                className="py-2"
              >
                <Text className="text-center text-primary font-home-bold text-[15px]">
                  {step === 2 ? "Back to Email Request" : "Back to Sign In"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
