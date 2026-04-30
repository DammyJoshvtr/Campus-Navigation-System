import axios from "axios";

interface SigninData {
  email: string;
  password: string;
}

interface SignupData {
  fullname: string;
  email: string;
  password: string;
}

const api = {
  baseUrl: "http://192.168.149.171:5000",
};

const authSignup = async (data: SignupData) => {
  try {
    const res = await axios.post(`${api.baseUrl}/api/auth/signup`, data);
    console.log(res.data);
    return res.data;
  } catch (err: any) {
    console.log("Signup Error: ", err.response?.data || err.message);
    throw err;
  }
};

const authSignin = async (data: SigninData) => {
  try {
    const res = await axios.post(`${api.baseUrl}/api/auth/login`, data);
    console.log(res.data);
    return res.data;
  } catch (err: any) {
    console.log("Signin Error: ", err.response?.data || err.message);
    throw err;
  }
};

const authVerifyOtp = async (email: string, otp: string) => {
  try {
    const res = await axios.post(`${api.baseUrl}/api/auth/verify-otp`, {
      email,
      otp,
    });
    console.log(res.data);
    return res.data;
  } catch (err: any) {
    console.log("Verify Error: ", err.response?.data || err.message);
    throw err;
  }
};

const authResendOtp = async (email: string) => {
  try {
    const res = await axios.post(`${api.baseUrl}/api/auth/resend-otp`, {
      email,
    });
    console.log(res.data);
    return res.data;
  } catch (err: any) {
    console.log("Resend OTP Error: ", err.response?.data || err.message);
    throw err;
  }
};

interface SaveDirectionData {
  user_id: number;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
}

const saveDirection = async (data: SaveDirectionData) => {
  try {
    const res = await axios.post(`${api.baseUrl}/api/directions/save`, data);
    return res.data;
  } catch (err: any) {
    console.log("Save Direction Error: ", err.response?.data || err.message);
    throw err;
  }
};

const getSavedDirections = async (userId: number) => {
  try {
    const res = await axios.get(`${api.baseUrl}/api/directions/${userId}`);
    return res.data;
  } catch (err: any) {
    console.log("Get Directions Error: ", err.response?.data || err.message);
    throw err;
  }
};

const deleteDirection = async (directionId: number) => {
  try {
    const res = await axios.delete(
      `${api.baseUrl}/api/directions/${directionId}`,
    );
    return res.data;
  } catch (err: any) {
    console.log("Delete Direction Error: ", err.response?.data || err.message);
    throw err;
  }
};

export default {
  authSignup,
  authSignin,
  authVerifyOtp,
  authResendOtp,
  saveDirection,
  getSavedDirections,
  deleteDirection,
};
