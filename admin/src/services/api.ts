import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Basic interfaces to make development easier for students
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
}

export interface Location {
  id: number;
  name: string;
  type: string;
  latitude?: number;
  longitude?: number;
  coordinate?: { latitude: number; longitude: number };
  image: string;
  description: string;
  approval_status: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  locationName: string;
  date: string;
  time: string;
  status: string;
  image: string;
  author: string;
  created_at: string;
  approval_status: string;
}

export const loginAdmin = (email: string, password: string) =>
  api.post("/auth/login", { email, password });

export const getOverview = async () => {
  // In a real app we'd have a /dashboard endpoint, but we can aggregate here
  const [users, events, locations] = await Promise.all([
    api.get("/users"),
    api.get("/events?all=true"),
    api.get("/locations?all=true"),
  ]);
  return {
    users: users.data as User[],
    events: events.data.events as Event[],
    locations: locations.data as Location[],
  };
};

// Locations
export const getLocations = () => api.get("/locations?all=true");
export const createLocation = (data: Partial<Location>) =>
  api.post("/locations", data);
export const updateLocation = (id: number, data: Partial<Location>) =>
  api.put(`/locations/${id}`, data);
export const deleteLocation = (id: number) => api.delete(`/locations/${id}`);

// Events
export const getEvents = () => api.get("/events?all=true");
export const createEvent = (data: Partial<Event>) =>
  api.post("/events/create", data); // Used create from backend
export const updateEvent = (id: number, data: Partial<Event>) =>
  api.put(`/events/${id}`, data);
export const deleteEvent = (id: number) => api.delete(`/events/${id}`);

// Users
export const getUsers = () => api.get("/users");
export const deleteUser = (id: number) => api.delete(`/users/${id}`);
export const updateUserRole = (id: number, role: string) =>
  api.put(`/users/${id}/role`, { role });

// Approvals
export const approveContent = (type: string, id: number, status: string) =>
  api.put(`/admin/approve/${type}/${id}`, { status });

// Uploads
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.url;
};

export default api;
