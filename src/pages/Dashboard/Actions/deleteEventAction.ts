import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import axiosInstance from "../../../services/api";

export async function deleteEventAction({ params }: ActionFunctionArgs) {
  const { eventId } = params;

  if (!eventId) {
    return { error: "Event ID is required" };
  }

  try {
    await axiosInstance.delete(`/events/${eventId}`);

    // Redirect back to dashboard after successful deletion
    return redirect("/dashboard");
  } catch (error: any) {
    console.error(error);

    return {
      error: error.response?.data?.message || "Failed to delete event",
    };
  }
}
