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
import * as XLSX from "xlsx";
import { Toast } from "../../components/Toast";
import { Loader } from "../../components/Loader";
import axiosInstance from "../../services/api";

// Helper function to format time to 12-hour format with AM/PM
const formatTimeToAMPM = (timeString: string): string => {
  // Extract time portion from datetime string (e.g., "2024-01-01T14:30:00" -> "14:30:00")
  const timePart = timeString.includes('T') ? timeString.split('T')[1] : timeString;

  // Extract hours and minutes
  const [hoursStr, minutesStr] = timePart.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;

  // Determine AM/PM
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  return `${hours}:${minutes} ${ampm}`;
};

export default function EventDetails() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [eventTab, setEventTab] = useState("attendees");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [attendeesSearchQuery, setAttendeesSearchQuery] = useState("");
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState("");
  const [attendanceCurrentPage, setAttendanceCurrentPage] = useState(1);
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
  const [attendanceData, setAttendanceData] = useState<{
    records: Array<{
      id: number;
      attendance_date: string;
      check_in_time: string;
      status: string;
      attendee: {
        id: number;
        employee_id: string;
        name: string;
        section: string;
        position: string;
        employment_status: string;
      };
    }>;
    summary: {
      total_attendees: number;
      unique_checked_in: number;
      total_check_ins: number;
      attendance_rate: string;
    };
  } | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string | null>(null);
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

  // Filter attendees by search query
  const filteredAttendees = attendeesData.filter((attendee) => {
    const query = attendeesSearchQuery.toLowerCase();
    return (
      attendee.employee_id.toLowerCase().includes(query) ||
      attendee.name.toLowerCase().includes(query) ||
      attendee.section.toLowerCase().includes(query) ||
      attendee.position.toLowerCase().includes(query) ||
      attendee.employment_status.toLowerCase().includes(query)
    );
  });

  // Pagination logic for attendees
  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAttendees = filteredAttendees.slice(startIndex, endIndex);

  // Reset to page 1 when attendees data or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [attendeesData.length, attendeesSearchQuery]);

  // Reset to page 1 when attendance search query changes
  useEffect(() => {
    setAttendanceCurrentPage(1);
  }, [attendanceSearchQuery]);

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

  // Check if event is multi-day
  const isMultiDayEvent = event?.event_start_date && event?.event_end_date
    ? new Date(event.event_start_date).toDateString() !== new Date(event.event_end_date).toDateString()
    : false;

  const selectedEvent = {
    title: event?.event_name || "Event",
    date: event?.event_start_date
      ? isMultiDayEvent
        ? `${new Date(event.event_start_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })} - ${new Date(event.event_end_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`
        : new Date(event.event_start_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
      : "N/A",
  };

  // Generate attendance dates for multi-day events
  const attendanceDates: string[] = [];
  if (isMultiDayEvent && event?.event_start_date && event?.event_end_date) {
    const start = new Date(event.event_start_date);
    const end = new Date(event.event_end_date);
    const current = new Date(start);

    while (current <= end) {
      attendanceDates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  }

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

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    if (!eventId) return;

    setAttendanceLoading(true);
    try {
      const response = await axiosInstance.get(`/events/${eventId}/attendance`);
      setAttendanceData(response.data.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to load attendance records";
      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Fetch attendance data when attendance tab is active
  useEffect(() => {
    if (eventTab === "attendance") {
      fetchAttendanceRecords();
    }
  }, [eventTab]);

  // Export attendance to Excel
  const handleDownloadAttendanceReport = () => {
    if (!attendanceData || !event) return;

    // Create workbook
    const workbook = XLSX.utils.book_new();

    if (isMultiDayEvent) {
      // For multi-day events: Create separate sheet for each day
      attendanceDates.forEach((dateStr) => {
        // Filter records for this specific date
        const dayRecords = attendanceData.records.filter((record) => {
          const recordDate = record.attendance_date.split('T')[0];
          return recordDate === dateStr;
        });

        // Prepare data for this day
        const excelData = dayRecords.map((record) => ({
          "Employee ID": record.attendee.employee_id,
          "Name": record.attendee.name,
          "Section": record.attendee.section,
          "Position": record.attendee.position,
          "Employment Status": record.attendee.employment_status,
          "Check-in Time": formatTimeToAMPM(record.check_in_time),
          "Status": record.status,
        }));

        // Create worksheet for this day
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Format sheet name as "Dec 30" or "Jan 1"
        const sheetName = new Date(dateStr).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });
    } else {
      // For single-day events: One sheet with all records (no date column)
      const excelData = attendanceData.records.map((record) => ({
        "Employee ID": record.attendee.employee_id,
        "Name": record.attendee.name,
        "Section": record.attendee.section,
        "Position": record.attendee.position,
        "Employment Status": record.attendee.employment_status,
        "Check-in Time": formatTimeToAMPM(record.check_in_time),
        "Status": record.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Records");
    }

    // Add summary sheet
    const summaryData = [
      { Metric: "Total Attendees", Value: attendanceData.summary.total_attendees },
      { Metric: "Unique Checked In", Value: attendanceData.summary.unique_checked_in },
      { Metric: "Total Check-ins", Value: attendanceData.summary.total_check_ins },
      { Metric: "Attendance Rate", Value: attendanceData.summary.attendance_rate },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Generate filename
    const eventName = event.event_name.replace(/[^a-z0-9]/gi, "-");
    const startDate = new Date(event.event_start_date).toISOString().split("T")[0];
    const endDate = new Date(event.event_end_date).toISOString().split("T")[0];

    const filename = isMultiDayEvent
      ? `${eventName}-Attendance-Report-${startDate}-to-${endDate}.xlsx`
      : `${eventName}-Attendance-Report-${startDate}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename, { bookType: "xlsx", type: "binary" });
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
            onClick={() => {
              setEventTab(t);
              // Refetch attendance data when clicking the attendance tab
              if (t === "attendance") {
                fetchAttendanceRecords();
              }
            }}
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
              {filteredAttendees.length} of {attendeesCount} {attendeesCount === 1 ? "person" : "people"}
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

          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by employee ID, name, section, position, or status..."
              value={attendeesSearchQuery}
              onChange={(e) => setAttendeesSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAttendees.length)} of {filteredAttendees.length}
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
      {eventTab === "attendance" && (() => {
        // Filter attendance records by search query and selected date
        const filteredAttendanceRecords = (attendanceData?.records || [])
          .filter((record) => {
            // Filter by selected date
            if (selectedAttendanceDate) {
              const recordDate = record.attendance_date.split('T')[0];
              if (recordDate !== selectedAttendanceDate) return false;
            }

            // Filter by search query
            if (attendanceSearchQuery) {
              const query = attendanceSearchQuery.toLowerCase();
              return (
                record.attendee.employee_id.toLowerCase().includes(query) ||
                record.attendee.name.toLowerCase().includes(query) ||
                record.attendee.section.toLowerCase().includes(query) ||
                record.attendee.position.toLowerCase().includes(query) ||
                record.attendee.employment_status.toLowerCase().includes(query) ||
                record.status.toLowerCase().includes(query)
              );
            }

            return true;
          });

        // Pagination for attendance
        const attendanceTotalPages = Math.ceil(filteredAttendanceRecords.length / itemsPerPage);
        const attendanceStartIndex = (attendanceCurrentPage - 1) * itemsPerPage;
        const attendanceEndIndex = attendanceStartIndex + itemsPerPage;
        const currentAttendanceRecords = filteredAttendanceRecords.slice(attendanceStartIndex, attendanceEndIndex);

        return (
        <div className="space-y-4">
          {attendanceLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader />
            </div>
          ) : (
            <>
              {/* Summary Statistics */}
              {attendanceData?.summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Total Attendees</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {attendanceData.summary.total_attendees}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Checked In</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {attendanceData.summary.unique_checked_in}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Total Check-ins</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {attendanceData.summary.total_check_ins}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Attendance Rate</p>
                    <p className="text-lg font-semibold text-teal-600">
                      {attendanceData.summary.attendance_rate}
                    </p>
                  </div>
                </div>
              )}

              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search by employee ID, name, section, position, or status..."
                  value={attendanceSearchQuery}
                  onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Header with Date Filter (for multi-day events) and Download */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex gap-1.5 flex-wrap">
                  {isMultiDayEvent && attendanceDates.length > 0 && (
                    <>
                      <button
                        onClick={() => setSelectedAttendanceDate(null)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          selectedAttendanceDate === null
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        All Days
                      </button>
                      {attendanceDates.map((date) => (
                        <button
                          key={date}
                          onClick={() => setSelectedAttendanceDate(date)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            selectedAttendanceDate === date
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {new Date(date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </button>
                      ))}
                    </>
                  )}
                </div>
                <button
                  onClick={handleDownloadAttendanceReport}
                  disabled={!attendanceData || attendanceData.records.length === 0}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
                          <th className="hidden xl:table-cell px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                            Employment Status
                          </th>
                          {isMultiDayEvent && (
                            <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                              Date
                            </th>
                          )}
                          <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                            Check-in Time
                          </th>
                          <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-600 whitespace-nowrap">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {currentAttendanceRecords.length > 0 ? (
                          currentAttendanceRecords.map((record, idx) => (
                              <tr
                                key={record.id}
                                className={`hover:bg-gray-50/50 transition-colors ${
                                  idx % 2 === 0 ? "" : "bg-gray-50/30"
                                }`}
                              >
                                <td className="px-3 py-2.5 text-xs text-gray-900 font-medium whitespace-nowrap">
                                  {record.attendee.employee_id}
                                </td>
                                <td className="px-3 py-2.5 text-xs text-gray-900 max-w-[150px] sm:max-w-none truncate sm:whitespace-normal">
                                  {record.attendee.name}
                                </td>
                                <td className="hidden md:table-cell px-3 py-2.5 text-xs text-gray-600 max-w-[200px] truncate">
                                  {record.attendee.section}
                                </td>
                                <td className="hidden lg:table-cell px-3 py-2.5 text-xs text-gray-600 max-w-[180px] truncate">
                                  {record.attendee.position}
                                </td>
                                <td className="hidden xl:table-cell px-3 py-2.5 text-xs">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
                                    {record.attendee.employment_status}
                                  </span>
                                </td>
                                {isMultiDayEvent && (
                                  <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                                    {new Date(record.attendance_date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </td>
                                )}
                                <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                                  {formatTimeToAMPM(record.check_in_time)}
                                </td>
                                <td className="px-3 py-2.5 text-xs">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">
                                    {record.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={isMultiDayEvent ? 8 : 7} className="px-3 py-12 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <p className="text-sm text-gray-500">No attendance records yet</p>
                                <p className="text-xs text-gray-400">
                                  Attendance will appear here when people check in
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {attendanceTotalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 bg-gray-50/50 border-t border-gray-200">
                    <div className="text-xs text-gray-600">
                      Showing {attendanceStartIndex + 1} to {Math.min(attendanceEndIndex, filteredAttendanceRecords.length)} of {filteredAttendanceRecords.length}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setAttendanceCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={attendanceCurrentPage === 1}
                        className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </button>
                      <div className="flex items-center gap-0.5 mx-1">
                        {Array.from({ length: attendanceTotalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setAttendanceCurrentPage(page)}
                            className={`min-w-[28px] px-2 py-1 text-xs font-medium rounded transition-colors ${
                              attendanceCurrentPage === page
                                ? "bg-gray-900 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setAttendanceCurrentPage((p) => Math.min(attendanceTotalPages, p + 1))}
                        disabled={attendanceCurrentPage === attendanceTotalPages}
                        className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        );
      })()}

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
