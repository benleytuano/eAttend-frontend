import { useEffect, useState } from "react";
import { Form, useActionData, useNavigate } from "react-router";
import { Calendar, Eye, X } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("ongoing");
  const [showAddModal, setShowAddModal] = useState(false);
  const actionData = useActionData() as
    | { success?: boolean; error?: string; errors?: any[] }
    | undefined;

  // Close modal on success
  useEffect(() => {
    if (actionData?.success) {
      setShowAddModal(false);
    }
  }, [actionData]);

  // Dummy Data
  const recently = [
    { id: 1, title: "Annual Tech Conference 2024", date: "Mar 15, 2024" },
    { id: 2, title: "Product Launch Webinar", date: "Feb 28, 2024" },
    { id: 3, title: "Team Building Workshop", date: "Apr 20, 2024" },
  ];

  const ongoing = [
    { id: 1, title: "Product Launch Webinar", date: "Feb 28, 2024" },
    { id: 2, title: "Developer Workshop Series", date: "Dec 15, 2024" },
    { id: 3, title: "Marketing Campaign Launch", date: "Dec 10, 2024" },
    { id: 4, title: "Sales Rally 2024", date: "Mar 1, 2024" },
  ];

  const upcoming = [
    { id: 1, title: "UX Design Bootcamp", date: "May 10, 2024" },
    { id: 2, title: "Mobile Mastery Training", date: "Jun 5, 2024" },
    { id: 3, title: "Leadership Advance Class", date: "Jul 8, 2024" },
    { id: 4, title: "Marketing Webinar", date: "Aug 2, 2024" },
  ];

  const completed = [
    { id: 1, title: "Annual Awards Night", date: "Dec 20, 2024" },
    { id: 2, title: "Q4 Team Building", date: "Oct 5, 2024" },
    { id: 3, title: "Cybersecurity Seminar", date: "Sept 12, 2024" },
    { id: 4, title: "Project Closure Meetup", date: "Aug 19, 2024" },
  ];

  const getEvents = () => {
    if (tab === "ongoing") return ongoing;
    if (tab === "upcoming") return upcoming;
    return completed;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-teal-700 text-white rounded-lg p-6 flex justify-between items-center">
        <div>
          <p className="text-xs uppercase tracking-wider font-medium">
            All Events
          </p>
          <h2 className="text-2xl font-semibold mt-1">Manage your events</h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white text-teal-700 px-4 py-2 rounded font-medium text-sm hover:bg-gray-100 transition"
        >
          + Add Event
        </button>
      </div>

      {/* Recently Added Section */}
      <div className="bg-white rounded-lg p-4">
        <p className="text-xs uppercase tracking-wider font-semibold text-gray-700 mb-4">
          Recent
        </p>

        <div className="max-h-44 overflow-y-auto">
          {recently.map((e) => (
            <div
              key={e.id}
              className="py-3 border-b border-gray-200 group last:border-b-0 flex justify-between"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{e.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Calendar size={12} /> {e.date}
                </div>
              </div>
              <Eye
                size={18}
                className="opacity-0 group-hover:opacity-100 transition cursor-pointer text-gray-400"
                onClick={() => navigate(`/dashboard/events/${e.id}`)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex gap-6 pb-2 border-b text-sm">
          {["ongoing", "upcoming", "completed"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 ${
                tab === t
                  ? "font-semibold border-b-2 border-black -mb-[2px]"
                  : "text-gray-500"
              }`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="mt-4 max-h-[260px] overflow-y-auto">
          {getEvents()
            .slice(0, 4)
            .map((e) => (
              <div
                key={e.id}
                className="py-3 flex justify-between border-b border-gray-200 group last:border-b-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{e.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar size={12} /> {e.date}
                    <span className="text-teal-600 font-medium">ongoing</span>
                  </div>
                </div>
                <Eye
                  size={18}
                  className="opacity-0 group-hover:opacity-100 transition cursor-pointer text-gray-400"
                  onClick={() => navigate(`/dashboard/events/${e.id}`)}
                />
              </div>
            ))}
        </div>
      </div>

      {/* ADD EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Event</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <Form method="post" className="space-y-4">
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {actionData.error}
                  {actionData.errors && (
                    <ul className="mt-2 list-disc list-inside text-xs">
                      {actionData.errors.map((err: any, idx: number) => (
                        <li key={idx}>{err.message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {actionData?.success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                  Event created successfully!
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name
                </label>
                <input
                  name="event_name"
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
                  className="w-full border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 text-white rounded text-sm font-medium hover:bg-teal-800"
                >
                  Add Event
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
