import GeneralButton from "@/components/GeneralButton";
import { icon } from "@/constant/icon";
import api from "@/services/api";
import { useRouter } from "expo-router";
import { CircleAlert } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Signin = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("signup"); // State to handle Login and Signin UI
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignupTab = () => {
    setActiveTab("signup");
    setErrorMsg(null);
  };

  const handleSigninTab = () => {
    setActiveTab("signin");
    setErrorMsg(null);
  };

  const handleAuth = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (activeTab === "signup") {
        if (!fullName || !email || !password) {
          setErrorMsg("Please fill in all fields.");
          setIsLoading(false);
          return;
        }

        await api.authSignup({ fullname: fullName, email, password });
        // Navigate to verify page and pass the email
        router.push({ pathname: "/verifyEmail", params: { email } });
      } else if (activeTab === "signin") {
        if (!email || !password) {
          setErrorMsg("Please enter your email and password.");
          setIsLoading(false);
          return;
        }

        await api.authSignin({ email, password });
        router.replace("/home");
      }
    } catch (err: any) {
      console.log("Auth Error Details: ", err.response?.data || err.message);
      // Show user-friendly error instead of raw backend error
      if (err.response?.status === 401) {
        setErrorMsg("Invalid email or password.");
      } else if (err.response?.status === 403) {
        // Account exists but is not verified. Backend automatically sent a new OTP.
        // Redirect user to the verify screen to complete verification.
        router.push({ pathname: "/verifyEmail", params: { email } });
      } else if (err.response?.status === 409) {
        setErrorMsg("An account with this email already exists.");
      } else {
        setErrorMsg("Something went wrong. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-between">
      {/* Top Section */}
      <View className="gap-y-6">
        {/* Tabs */}
        <View className="w-full items-center mt-2">
          {/* tab selection */}
          <View className="flex-row rounded-full p-1 w-[85%] h-12 bg-gray-100">
            {/* Signup Tab */}
            <Pressable
              onPress={handleSignupTab}
              className={`flex-1 justify-center items-center rounded-full ${
                activeTab === "signup" ? "bg-white" : ""
              }`}
              style={activeTab === "signup" ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : {}}
            >
              <Text
                className={`font-home-semibold text-[16px] ${
                  activeTab === "signup" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Sign Up
              </Text>
            </Pressable>

            {/* Signin Tab */}
            <Pressable
              onPress={handleSigninTab}
              className={`flex-1 justify-center items-center rounded-full ${
                activeTab === "signin" ? "bg-white" : ""
              }`}
              style={activeTab === "signin" ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 } : {}}
            >
              <Text
                className={`font-home-semibold text-[16px] ${
                  activeTab === "signin" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Error UI */}
        {errorMsg && (
          <View className="mx-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex-row items-center gap-x-3">
            <CircleAlert size={20} color="#EF4444" />
            <Text className="text-red-600 font-home-medium text-[14px] flex-1">
              {errorMsg}
            </Text>
          </View>
        )}

        {/* Form */}
        <View className="gap-y-4 px-6 mt-2">
          {/* Show Full Name only on Signup */}
          {activeTab === "signup" && (
            <View>
              <Text className="mb-2 text-[14px] text-gray-600 font-home-semibold">
                Full Name
              </Text>

              <TextInput
                className="h-14 rounded-xl bg-gray-50 border border-gray-200 px-4 text-[15px] font-home-medium text-gray-800"
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                editable={!isLoading}
              />
            </View>
          )}

          {/* Email */}
          <View>
            <Text className="mb-2 text-[14px] text-gray-600 font-home-semibold">
              Email Address
            </Text>

            <TextInput
              className="h-14 rounded-xl bg-gray-50 border border-gray-200 px-4 text-[15px] font-home-medium text-gray-800"
              placeholder="johndoe@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />
          </View>

          {/* Password */}
          <View>
            <Text className="mb-2 text-[14px] text-gray-600 font-home-semibold">
              Password
            </Text>

            <TextInput
              className="h-14 rounded-xl bg-gray-50 border border-gray-200 px-4 text-[15px] font-home-medium text-gray-800"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Button */}
        <View className="mt-4 px-6 flex justify-center items-center">
          {isLoading ? (
            <View className="w-full h-14 bg-primary rounded-xl items-center justify-center">
              <ActivityIndicator color="white" />
            </View>
          ) : (
            <GeneralButton
              title={activeTab === "signup" ? "Create Account" : "Sign In"}
              showIcon={false}
              onPress={handleAuth}
            />
          )}
        </View>
      </View>

      {/* Bottom Section */}
      <View className="gap-y-6 mb-8 px-6">
        {/* Divider */}
        <View className="flex-row items-center">
          <View className="flex-1 h-[1px] bg-gray-200" />

          <Text className="mx-4 text-gray-500 text-[13px] font-home-regular">
            Or continue with
          </Text>

          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        {/* Google Button */}
        <Pressable 
          className="h-14 flex-row items-center justify-center gap-x-3 bg-white border border-gray-200 rounded-xl"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
        >
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
