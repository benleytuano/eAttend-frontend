import type { ActionFunctionArgs } from "react-router";
import axiosInstance from "../../../services/api";

export async function addEventAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const event_name = formData.get("event_name");
  const event_start_date = formData.get("event_start_date");
  const event_end_date = formData.get("event_end_date");

  try {
    const response = await axiosInstance.post("/events", {
      event_name,
      event_start_date,
      event_end_date,
    });

    console.log(response);

    return {
      success: true,
      message: "Event created successfully",
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

    return { error: error.response?.data?.message || "Failed to create event" };
  }
}
