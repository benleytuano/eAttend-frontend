import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // change as needed
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default axiosInstance;
