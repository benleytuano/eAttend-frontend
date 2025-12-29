import { useEffect, useState } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router";
import { Calendar, X, Download, QrCode, Pencil, Trash2, Upload, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Toast } from "../../components/Toast";
import { Loader } from "../../components/Loader";
import axiosInstance from "../../services/api";

export default function EventDetails() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [eventTab, setEventTab] = useState("attendees");
  const [selectedDate, setSelectedDate] = useState("Mar 15");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [qrData, setQrData] = useState<{
    token: string;
    url: string;
    expiresAt: string;
    event?: {
      id: number;
      event_id: string;
      event_name: string;
      event_start_date: string;
      event_end_date: string;
    };
  } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const itemsPerPage = 5;

  const actionData = useActionData() as
    | { success?: boolean; error?: string; message?: string }
    | undefined;

  const loaderData = useLoaderData() as {
    event: {
      data: {
        id: number;
        event_name: string;
        event_start_date: string;
        event_end_date: string;
        created_at: string;
      };
    };
    attendees: {
      data: {
        count: number;
        attendees: Array<{
          id: number;
          event_id: number;
          employee_id: string;
          name: string;
          section: string;
          position: string;
          employment_status: string;
          created_at: string;
        }>;
      };
    };
  };

  const event = loaderData?.event?.data;
  const attendeesData = loaderData?.attendees?.data?.attendees || [];
  const attendeesCount = loaderData?.attendees?.data?.count || 0;

  // Pagination logic
  const totalPages = Math.ceil(attendeesData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAttendees = attendeesData.slice(startIndex, endIndex);

  // Reset to page 1 when attendees data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [attendeesData.length]);

  // Handle action data (success/error)
  useEffect(() => {
    if (actionData?.success) {
      setShowEditModal(false);
      setShowUploadModal(false);
      setSelectedFile(null);
      setToast({
        message: actionData.message || "Operation completed successfully!",
        type: "success",
      });
    } else if (actionData?.error) {
      setToast({
        message: actionData.error,
        type: "error",
      });
    }
  }, [actionData]);

  const selectedEvent = {
    title: event?.event_name || "Event",
    date: event?.event_start_date
      ? `${new Date(event.event_start_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })} - ${new Date(event.event_end_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`
      : "N/A",
  };

  const attendanceDates = ["Mar 15", "Mar 16", "Mar 17", "Mar 18"];

  const attendanceData = [
    {
      id: "03-001",
      name: "Santos Juan M",
      section: "Human Resource Welfare Section",
      position: "Administrative Officer II",
      status: "Permanent",
      attendance: "Present",
    },
  ];

  // Generate QR Code
  const handleGenerateQR = async () => {
    setQrLoading(true);
    try {
      const response = await axiosInstance.post(
        `/events/${eventId}/generate-qr`
      );
      // API returns { success, message, data: { token, url, expiresAt, event } }
      setQrData(response.data.data);
      setShowQRModal(true);
    } catch (error: any) {
      const errorCode = error.response?.data?.error;
      let errorMessage = error.response?.data?.message || "Failed to generate QR code";

      // Handle specific error cases
      switch (errorCode) {
        case "EVENT_ENDED":
          errorMessage = "Cannot generate QR code. This event has already ended.";
          break;
        case "FORBIDDEN":
          errorMessage = "Access denied. You don't have permission to generate QR code for this event.";
          break;
        case "NOT_FOUND":
          errorMessage = "Event not found.";
          break;
        case "UNAUTHORIZED":
          errorMessage = "Please log in to generate QR code.";
          break;
      }

      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setQrLoading(false);
    }
  };

  // Copy URL to clipboard
  const handleCopyURL = async () => {
    if (qrData?.url) {
      try {
        await navigator.clipboard.writeText(qrData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        setToast({
          message: "Failed to copy to clipboard",
          type: "error",
        });
      }
    }
  };

  // Download QR Code
  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `event-${eventId}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="flex items-start justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {selectedEvent.title}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
            <Calendar size={14} />
            <span>{selectedEvent.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateQR}
            disabled={qrLoading}
            className="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generate QR Code"
          >
            {qrLoading ? <Loader size="sm" /> : <QrCode size={16} />}
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Edit Event"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Event"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors ml-2"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200">
        {["attendees", "attendance"].map((t) => (
          <button
            key={t}
            onClick={() => setEventTab(t)}
            className={`pb-2 text-xs font-medium transition-colors ${
              eventTab === t
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ATTENDEES TAB */}
      {eventTab === "attendees" && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              {attendeesCount} {attendeesCount === 1 ? "person" : "people"}
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Upload size={14} />
              <span className="hidden sm:inline">Upload CSV/Excel</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                        Employee ID
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                        Name
                      </th>
                      <th className="hidden md:table-cell px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                        Section
                      </th>
                      <th className="hidden lg:table-cell px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                        Position
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentAttendees.length > 0 ? (
                      currentAttendees.map((attendee, idx) => (
                        <tr
                          key={attendee.id}
                          className={`hover:bg-gray-50/50 transition-colors ${
                            idx % 2 === 0 ? "" : "bg-gray-50/30"
                          }`}
                        >
                          <td className="px-3 py-2.5 text-xs text-gray-900 font-medium whitespace-nowrap">
                            {attendee.employee_id}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-gray-900 max-w-[150px] sm:max-w-none truncate sm:whitespace-normal">
                            {attendee.name}
                          </td>
                          <td className="hidden md:table-cell px-3 py-2.5 text-xs text-gray-600 max-w-[200px] truncate">
                            {attendee.section}
                          </td>
                          <td className="hidden lg:table-cell px-3 py-2.5 text-xs text-gray-600 max-w-[180px] truncate">
                            {attendee.position}
                          </td>
                          <td className="px-3 py-2.5 text-xs">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
                              {attendee.employment_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-sm text-gray-500">No attendees yet</p>
                            <button
                              onClick={() => setShowUploadModal(true)}
                              className="text-xs text-gray-600 hover:text-gray-900 underline"
                            >
                              Upload a CSV/Excel file to get started
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 bg-gray-50/50 border-t border-gray-200">
                <div className="text-xs text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, attendeesCount)} of {attendeesCount}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>
                  <div className="flex items-center gap-0.5 mx-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[28px] px-2 py-1 text-xs font-medium rounded transition-colors ${
                          currentPage === page
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {eventTab === "attendance" && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {attendanceDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedDate === date
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>
            <button className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto">
              <Download size={14} />
              <span className="hidden sm:inline">Download Report</span>
              <span className="sm:hidden">Download</span>
            </button>
          </div>

          {/* Attendance Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                        Employee ID
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                        Name
                      </th>
                      <th className="hidden md:table-cell px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                        Section
                      </th>
                      <th className="hidden lg:table-cell px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                        Position
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {attendanceData.map((attendee, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-gray-50/50 transition-colors ${
                          idx % 2 === 0 ? "" : "bg-gray-50/30"
                        }`}
                      >
                        <td className="px-3 py-2.5 text-xs text-gray-900 font-medium whitespace-nowrap">
                          {attendee.id}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-gray-900 max-w-[150px] sm:max-w-none truncate sm:whitespace-normal">
                          {attendee.name}
                        </td>
                        <td className="hidden md:table-cell px-3 py-2.5 text-xs text-gray-600 max-w-[200px] truncate">
                          {attendee.section}
                        </td>
                        <td className="hidden lg:table-cell px-3 py-2.5 text-xs text-gray-600 max-w-[180px] truncate">
                          {attendee.position}
                        </td>
                        <td className="px-3 py-2.5 text-xs">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
                            {attendee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Event</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <Form method="post" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name
                </label>
                <input
                  name="event_name"
                  defaultValue={event?.event_name}
                  className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  name="event_start_date"
                  type="date"
                  defaultValue={
                    event?.event_start_date
                      ? new Date(event.event_start_date)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  name="event_end_date"
                  type="date"
                  defaultValue={
                    event?.event_end_date
                      ? new Date(event.event_end_date)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300"
                  disabled={navigation.state === "submitting"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="px-4 py-2 bg-teal-700 text-white rounded text-sm font-medium hover:bg-teal-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {navigation.state === "submitting" ? (
                    <>
                      <Loader size="sm" />
                      Updating...
                    </>
                  ) : (
                    "Update Event"
                  )}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-red-600">
                Delete Event
              </h2>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to delete "{event?.event_name}"? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  submit(null, {
                    method: "post",
                    action: `/dashboard/events/${eventId}/delete`,
                  });
                }}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD ATTENDEES MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Upload Attendees</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <Form
              method="post"
              action={`/dashboard/events/${eventId}/upload-attendees`}
              encType="multipart/form-data"
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV or Excel File
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
                {selectedFile && (
                  <p className="mt-2 text-xs text-gray-600">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-gray-700">
                  <strong>Note:</strong> Supported file formats: CSV (.csv), Excel (.xls, .xlsx)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300"
                  disabled={navigation.state === "submitting"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={navigation.state === "submitting" || !selectedFile}
                  className="px-4 py-2 bg-teal-700 text-white rounded text-sm font-medium hover:bg-teal-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {navigation.state === "submitting" ? (
                    <>
                      <Loader size="sm" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Event QR Code</h2>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setCopied(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 border-2 border-gray-200 rounded-lg">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrData.url}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Event Info */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  {selectedEvent.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Valid until: {new Date(qrData.expiresAt).toLocaleString()}
                </p>
              </div>

              {/* URL Display with Copy */}
              <div className="w-full">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Attendance URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrData.url}
                    readOnly
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded bg-gray-50 text-gray-600 font-mono"
                  />
                  <button
                    onClick={handleCopyURL}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    title="Copy URL"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Copy size={16} className="text-gray-600" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Share this URL or scan the QR code to mark attendance
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <Download size={16} />
                  Download QR
                </button>
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setCopied(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
