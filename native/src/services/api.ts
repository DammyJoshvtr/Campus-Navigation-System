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

export interface EventData {
  title: string;
  description: string;
  locationName: string;
  date: string;
  time: string;
  status: string;
  image?: string;
  author: string;
}

type Location = {
  id: number;
  name: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  type: string;
  image?: string;
  floorplan?: string;
};

const api = {
  // Use the env var directly as it now contains the full path /api or just use the host
  // If env var has /api, we shouldn't append /api again. 
  // Let's strip /api from env var if it exists, and use standard formatting.
  baseUrl: (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.189:5000').replace(/\/api\/?$/, ''),
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

const authForgotPassword = async (email: string) => {
  try {
    const res = await axios.post(`${api.baseUrl}/api/auth/forgot-password`, {
      email,
    });
    console.log(res.data);
    return res.data;
  } catch (err: any) {
    console.log("Forgot Password Error: ", err.response?.data || err.message);
    throw err;
  }
};

const authResetPassword = async (email: string, otp: string, data: any) => {
  try {
    const res = await axios.post(`${api.baseUrl}/api/auth/reset-password`, {
      email,
      otp,
      ...data,
    });
    console.log(res.data);
    return res.data;
  } catch (err: any) {
    console.log("Reset Password Error: ", err.response?.data || err.message);
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

const createEvent = async (data: EventData) => {
  try {
    const res = await axios.post(`${api.baseUrl}/api/events/create`, data);
    return res.data;
  } catch (err: any) {
    console.log("Create Event Error: ", err.response?.data || err.message);
    throw err;
  }
};

const getEvents = async () => {
  try {
    const res = await axios.get(`${api.baseUrl}/api/events`);
    return res.data;
  } catch (err: any) {
    console.log("Get Events Error: ", err.response?.data || err.message);
    throw err;
  }
};

const getLocations = async () => {
  try {
    const res = await axios.get(`${api.baseUrl}/api/locations`);
    return res.data;
  } catch (err: any) {
    console.log("Get Locations Error: ", err.response?.data || err.message);
    throw err;
  }
};

export interface ProfileData {
  name: string;
  studentId: string;
  faculty: string;
  level: string;
}

const updateProfile = async (id: number, data: ProfileData, token: string) => {
  try {
    const res = await axios.put(`${api.baseUrl}/api/users/${id}/profile`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err: any) {
    console.log("Update Profile Error: ", err.response?.data || err.message);
    throw err;
  }
};

const getUserStats = async (id: number, token: string) => {
  try {
    const res = await axios.get(`${api.baseUrl}/api/users/${id}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err: any) {
    console.log("Get Stats Error: ", err.response?.data || err.message);
    throw err;
  }
};

export default {
  authSignup,
  authSignin,
  authVerifyOtp,
  authResendOtp,
  authForgotPassword,
  authResetPassword,
  saveDirection,
  getSavedDirections,
  deleteDirection,
  createEvent,
  getEvents,
  getLocations,
  updateProfile,
  getUserStats,
};
