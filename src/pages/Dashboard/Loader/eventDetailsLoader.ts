import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import axiosInstance from "../../../services/api";

export default async function eventDetailsLoader({
  params,
}: LoaderFunctionArgs) {
  const token = sessionStorage.getItem("authToken");

  if (!token) {
    return redirect("/");
  }

  const { eventId } = params;

  if (!eventId) {
    throw new Error("Event ID is required");
  }

  try {
    // Fetch both event details and attendees in parallel
    const [eventResponse, attendeesResponse] = await Promise.all([
      axiosInstance.get(`/events/${eventId}`),
      axiosInstance.get(`/attendees/${eventId}`),
    ]);

    return {
      event: eventResponse.data,
      attendees: attendeesResponse.data,
    };
  } catch (error: any) {
    // Handle token expiration
    if (error.response?.status === 401 || error.response?.status === 403) {
      sessionStorage.removeItem("authToken");
      return redirect("/");
    }

    console.error("Failed to fetch event data:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch event data");
  }
}
