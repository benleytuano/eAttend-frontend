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
import { Calendar, X, Download, QrCode, Pencil, Trash2 } from "lucide-react";
import { Toast } from "../../components/Toast";
import { Loader } from "../../components/Loader";

export default function EventDetails() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [eventTab, setEventTab] = useState("attendees");
  const [selectedDate, setSelectedDate] = useState("Mar 15");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const actionData = useActionData() as
    | { success?: boolean; error?: string; message?: string }
    | undefined;

  const loaderData = useLoaderData() as {
    data: {
      id: number;
      event_name: string;
      event_start_date: string;
      event_end_date: string;
      created_at: string;
    };
  };

  const event = loaderData?.data;

  // Handle action data (success/error)
  useEffect(() => {
    if (actionData?.success) {
      setShowEditModal(false);
      setToast({
        message: actionData.message || "Event updated successfully!",
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

  const attendeesData = [
    {
      id: "03-001",
      name: "Santos Juan M",
      section: "Human Resource Welfare Section",
      position: "Administrative Officer II",
      status: "Permanent",
    },
    {
      id: "03-002",
      name: "Maria Santos",
      section: "Finance Department",
      position: "Budget Officer",
      status: "Permanent",
    },
    {
      id: "03-003",
      name: "John Smith",
      section: "IT Services",
      position: "System Administrator",
      status: "Contractual",
    },
  ];

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

  return (
    <div className="space-y-4">
      {/* Event Header */}
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedEvent.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <Calendar size={16} /> {selectedEvent.date}
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => alert("QR Code generation coming soon!")}
            className="border border-gray-400 p-2 rounded hover:bg-white transition text-gray-700 hover:text-gray-900 relative group"
          >
            <QrCode size={20} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
              Generate QR Code
            </span>
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="border border-gray-400 p-2 rounded hover:bg-white transition text-gray-700 hover:text-gray-900 relative group"
          >
            <Pencil size={20} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
              Edit Event
            </span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="border border-gray-400 p-2 rounded hover:bg-white transition text-red-600 hover:text-red-700 relative group"
          >
            <Trash2 size={20} />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
              Delete Event
            </span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b mt-6 pt-4">
          {["attendees", "attendance"].map((t) => (
            <button
              key={t}
              onClick={() => setEventTab(t)}
              className={`pb-3 text-sm font-medium ${
                eventTab === t
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-500"
              }`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ATTENDEES TAB */}
      {eventTab === "attendees" && (
        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm"></p>
            <button className="bg-teal-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-teal-800 transition">
              + Add Attendee
            </button>
          </div>

          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    NAME
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    SECTION
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    POSITION
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    EMPLOYMENT STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendeesData.map((attendee, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-4 text-gray-900">{attendee.id}</td>
                    <td className="px-4 py-4 text-gray-900">{attendee.name}</td>
                    <td className="px-4 py-4 text-gray-700">
                      {attendee.section}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {attendee.position}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {attendee.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {eventTab === "attendance" && (
        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm"></p>
            <button className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2">
              <Download size={16} /> Download Report
            </button>
          </div>

          {/* Date Selector */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {attendanceDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  selectedDate === date
                    ? "bg-teal-700 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {date}
              </button>
            ))}
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    NAME
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    SECTION
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    POSITION
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    EMPLOYMENT STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((attendee, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-4 text-gray-900">{attendee.id}</td>
                    <td className="px-4 py-4 text-gray-900">{attendee.name}</td>
                    <td className="px-4 py-4 text-gray-700">
                      {attendee.section}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {attendee.position}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {attendee.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
