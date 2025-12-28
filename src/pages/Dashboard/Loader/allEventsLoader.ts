import { redirect } from "react-router";
import axiosInstance from "../../../services/api";

export default async function allEventsLoader() {
  const token = sessionStorage.getItem("authToken");

  if (!token) {
    return redirect("/");
  }

  try {
    const response = await axiosInstance.get("/events");
    return response.data;
  } catch (error: any) {
    // Handle token expiration
    if (error.response?.status === 401 || error.response?.status === 403) {
      sessionStorage.removeItem("authToken");
      return redirect("/");
    }

    console.error("Failed to fetch events:", error);
    return { data: { events: [], count: 0 } };
  }
}
