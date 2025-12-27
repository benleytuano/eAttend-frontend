import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Calendar, X, Download } from "lucide-react";

export default function EventDetails() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [eventTab, setEventTab] = useState("attendees");
  const [selectedDate, setSelectedDate] = useState("Mar 15");

  // Dummy event data (you would fetch this based on eventId)
  const selectedEvent = {
    title: "Annual Tech Conference 2024",
    date: "Mar 15, 2024",
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
        <div className="flex gap-2 mt-6 flex-wrap">
          <button className="border border-gray-400 px-4 py-2 rounded text-sm hover:bg-white transition font-medium">
            Generate QR
          </button>
          <button className="border border-gray-400 px-4 py-2 rounded text-sm hover:bg-white transition font-medium">
            Edit
          </button>
          <button className="border border-gray-400 px-4 py-2 rounded text-sm hover:bg-white transition font-medium">
            Delete
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
    </div>
  );
}
