import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { Calendar, Eye } from "lucide-react";

export default function AllEvents() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("ongoing");
  const [showAddModal, setShowAddModal] = useState(false);
  const loaderData = useLoaderData() as {
    data: { events: any[]; count: number };
  };

  // Get events from loader data
  const events = loaderData?.data?.events || [];

  // Filter events by status based on dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const categorizeEvent = (event: any) => {
    const startDate = new Date(event.event_start_date);
    const endDate = new Date(event.event_end_date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) return "completed";
    if (startDate > today) return "upcoming";
    return "ongoing";
  };

  const ongoing = events
    .filter((e) => categorizeEvent(e) === "ongoing")
    .map((e) => ({
      id: e.id,
      title: e.event_name,
      date: new Date(e.event_start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

  const upcoming = events
    .filter((e) => categorizeEvent(e) === "upcoming")
    .map((e) => ({
      id: e.id,
      title: e.event_name,
      date: new Date(e.event_start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

  const completed = events
    .filter((e) => categorizeEvent(e) === "completed")
    .map((e) => ({
      id: e.id,
      title: e.event_name,
      date: new Date(e.event_start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

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
          <h2 className="text-2xl font-semibold mt-1">All Events</h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white text-teal-700 px-4 py-2 rounded font-medium text-sm hover:bg-gray-100 transition"
        >
          + Add Event
        </button>
      </div>

      {/* All Events Tabs */}
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

        <div className="mt-4 max-h-[585px] overflow-y-auto">
          {getEvents().length > 0 ? (
            getEvents().map((e) => (
              <div
                key={e.id}
                className="py-3 flex justify-between border-b border-gray-200 group last:border-b-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{e.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar size={12} /> {e.date}
                  </div>
                </div>
                <Eye
                  size={18}
                  className="opacity-0 group-hover:opacity-100 cursor-pointer transition text-gray-400"
                  onClick={() => navigate(`/dashboard/events/${e.id}`)}
                />
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p className="text-sm">No {tab} events</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-lg font-semibold mb-4">Add Event</h2>

            <div className="space-y-4">
              <input
                className="w-full border p-2 rounded text-sm"
                placeholder="Event Name"
              />
              <input
                type="date"
                className="w-full border p-2 rounded text-sm"
              />
              <input
                type="date"
                className="w-full border p-2 rounded text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-teal-700 text-white rounded text-sm font-medium hover:bg-teal-800">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
