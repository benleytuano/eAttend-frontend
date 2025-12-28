import type { ActionFunctionArgs } from "react-router";
import axiosInstance from "../../../services/api";

export async function updateEventAction({
  request,
  params,
}: ActionFunctionArgs) {
  const { eventId } = params;

  if (!eventId) {
    return { error: "Event ID is required" };
  }

  const formData = await request.formData();
  const event_name = formData.get("event_name");
  const event_start_date = formData.get("event_start_date");
  const event_end_date = formData.get("event_end_date");
  const status = formData.get("status");

  try {
    const updateData: any = {};

    if (event_name) updateData.event_name = event_name;
    if (event_start_date) updateData.event_start_date = event_start_date;
    if (event_end_date) updateData.event_end_date = event_end_date;
    if (status) updateData.status = status;

    const response = await axiosInstance.put(`/events/${eventId}`, updateData);

    return {
      success: true,
      message: "Event updated successfully",
      data: response.data.data,
    };
  } catch (error: any) {
    console.error(error);

    // Handle validation errors
    if (error.response?.data?.errors) {
      return {
        error: error.response.data.message || "Validation failed",
        errors: error.response.data.errors,
      };
    }

    return { error: error.response?.data?.message || "Failed to update event" };
  }
}
