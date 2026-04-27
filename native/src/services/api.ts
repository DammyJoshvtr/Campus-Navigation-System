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
  baseUrl: "http://192.168.231.171:5000",
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

export default { authSignup, authSignin, authVerifyOtp, authResendOtp };
