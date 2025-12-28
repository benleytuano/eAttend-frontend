import { useEffect, useState } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router";
import { Calendar, Eye, X } from "lucide-react";
import { Toast } from "../../components/Toast";
import { Loader } from "../../components/Loader";

export default function Dashboard() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [tab, setTab] = useState("ongoing");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loaderData = useLoaderData() as {
    data: { events: any[]; count: number };
  };
  const actionData = useActionData() as
    | { success?: boolean; error?: string; errors?: any[]; message?: string }
    | undefined;

  // Close modal on success and show toast
  useEffect(() => {
    if (actionData?.success) {
      setShowAddModal(false);
      setToast({
        message: actionData.message || "Event created successfully!",
        type: "success",
      });
    } else if (actionData?.error) {
      setToast({
        message: actionData.error,
        type: "error",
      });
    }
  }, [actionData]);

  // Get events from loader data
  const events = loaderData?.data?.events || [];

  // Get recently added events (latest 6)
  const recently = events
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 6)
    .map((e) => ({
      id: e.id,
      title: e.event_name,
      date: new Date(e.event_start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

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
          Recently Added
        </p>

        <div className="max-h-52 overflow-y-auto">
          {recently.length > 0 ? (
            recently.map((e) => (
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
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p className="text-sm">No recently added events</p>
            </div>
          )}
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
                  className="opacity-0 group-hover:opacity-100 transition cursor-pointer text-gray-400"
                  onClick={() => navigate(`/dashboard/events/${e.id}`)}
                />
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p className="text-sm">No {tab} events</p>
            </div>
          )}
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
                      Adding...
                    </>
                  ) : (
                    "Add Event"
                  )}
                </button>
              </div>
            </Form>
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
