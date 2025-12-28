import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import axiosInstance from "../../../services/api";

export async function uploadAttendeesAction({ params, request }: ActionFunctionArgs) {
  const { eventId } = params;

  if (!eventId) {
    return { error: "Event ID is required" };
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return { error: "Please select a file to upload" };
    }

    // Validate file type (CSV or Excel)
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!validTypes.includes(file.type)) {
      return {
        error: "Invalid file type. Please upload a CSV or Excel file (.csv, .xls, .xlsx)",
      };
    }

    // Create FormData for file upload
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    // Send to API endpoint
    await axiosInstance.post(
      `/attendees/${eventId}/upload`,
      uploadFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Redirect back to event details to reload the data
    return redirect(`/dashboard/events/${eventId}`);
  } catch (error: any) {
    console.error(error);

    // Handle validation errors
    if (error.response?.data?.errors) {
      return {
        error: error.response.data.message || "Validation failed",
        errors: error.response.data.errors,
      };
    }

    return {
      error: error.response?.data?.message || "Failed to upload attendees",
    };
  }
}
