import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import axiosInstance from "../../services/api";

interface VerifiedEvent {
  id: number;
  event_id: string;
  event_name: string;
  event_start_date: string;
  event_end_date: string;
  status: string;
  creator: {
    id: number;
    username: string;
    email: string;
  };
}

export default function CheckInPage() {
  const [searchParams] = useSearchParams();
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [eventData, setEventData] = useState<VerifiedEvent | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  // Verify QR token on mount
  useEffect(() => {
    const verifyQRToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setVerificationError("No QR token provided. Please scan a valid QR code.");
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.post("/events/verify-qr", {
          token,
        });

        if (response.data.success && response.data.data.valid) {
          setEventData(response.data.data.event);
          setVerificationError(null);
        } else {
          setVerificationError(
            response.data.message || "Invalid QR code"
          );
        }
      } catch (error: any) {
        const errorCode = error.response?.data?.error;
        let errorMessage = error.response?.data?.message || "Failed to verify QR code";

        // Handle specific error cases from API
        switch (errorCode) {
          case "QR_CODE_INVALIDATED":
            errorMessage =
              "This QR code has been invalidated. Please ask the organizer for the latest QR code.";
            break;
          case "TOKEN_EXPIRED":
            errorMessage = "This QR code has expired.";
            break;
          case "INVALID_TOKEN":
            errorMessage = "Invalid QR code. Please scan a valid code.";
            break;
          case "EVENT_NOT_FOUND":
            errorMessage = "Event not found.";
            break;
          case "TOKEN_REQUIRED":
            errorMessage = "QR token is required.";
            break;
        }

        setVerificationError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyQRToken();
  }, [searchParams]);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (message?.type === "success") {
      const timer = setTimeout(() => {
        setEmployeeNumber("");
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleEmployeeNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 5);
    setEmployeeNumber(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeNumber.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your employee number",
      });
      return;
    }

    const token = searchParams.get("token");
    if (!token) {
      setMessage({
        type: "error",
        text: "QR token is missing",
      });
      return;
    }

    const fullEmployeeId = `03-${employeeNumber}`;
    setSubmitting(true);

    try {
      const response = await axiosInstance.post("/events/mark-attendance", {
        token,
        employee_id: fullEmployeeId,
      });

      if (response.data.success) {
        const attendanceData = response.data.data;
        setMessage({
          type: "success",
          text: `✓ Successfully logged attendance! Welcome ${attendanceData.attendee?.name || ""}`,
        });
      } else {
        setMessage({
          type: "error",
          text: response.data.message || "Failed to log attendance",
        });
      }
    } catch (error: any) {
      const errorCode = error.response?.data?.error;
      let errorMessage = error.response?.data?.message || "Failed to mark attendance";

      // Handle specific error cases
      switch (errorCode) {
        case "TOKEN_EXPIRED":
          errorMessage = "This QR code has expired.";
          break;
        case "INVALID_TOKEN":
          errorMessage = "Invalid QR code.";
          break;
        case "QR_CODE_INVALIDATED":
          errorMessage = "This QR code has been invalidated. Please ask the organizer for the latest QR code.";
          break;
        case "EVENT_NOT_FOUND":
          errorMessage = "Event not found.";
          break;
        case "EMPLOYEE_NOT_FOUND":
          errorMessage = "You are not registered as an attendee for this event.";
          break;
        case "ALREADY_CHECKED_IN":
          errorMessage = "You have already checked in for today.";
          break;
        case "EMPLOYEE_ID_REQUIRED":
          errorMessage = "Employee ID is required.";
          break;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="h-8 w-8 border-4 border-slate-300 border-t-blue-600 rounded-full"></div>
          </div>
          <p className="text-slate-600">Verifying QR code...</p>
        </div>
      </div>
    );
  }

  // Error state (invalid QR)
  if (verificationError) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-3">
            Invalid QR Code
          </h1>
          <p className="text-slate-600 mb-6">{verificationError}</p>
          <div className="text-sm text-slate-500">
            Please contact the event organizer for assistance.
          </div>
        </div>
      </div>
    );
  }

  // Success state - show check-in form
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <img src="/hrmdd_logo.png" alt="Logo" className="h-32 mb-8" />

      {/* Event Name */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          {eventData?.event_name}
        </h1>
        <p className="text-sm text-slate-500">
          {new Date(eventData?.event_start_date || "").toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          )}
          {" - "}
          {new Date(eventData?.event_end_date || "").toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          )}
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6">
          <p className="text-sm text-slate-500 mb-6">
            Enter your employee number
          </p>

          <div className="flex items-center border-b border-slate-200 focus-within:border-blue-600 transition-all">
            <div className="text-slate-400 font-medium text-sm">03-</div>
            <input
              id="employeeNumber"
              type="text"
              inputMode="numeric"
              value={employeeNumber}
              onChange={handleEmployeeNumberChange}
              placeholder="00001"
              disabled={submitting}
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
              className="flex-1 px-3 py-3 border-none focus:outline-none text-base font-mono disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
            />
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-md text-sm font-medium mb-6 ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full py-2.5 px-3 rounded-md font-medium text-sm transition-all ${
            submitting
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
          }`}
        >
          {submitting ? "Processing..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
