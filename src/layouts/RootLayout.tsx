import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  ChevronLeft,
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

export default function RootLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    navigate("/");
  };

  // Get user data from sessionStorage
  const userDataString = sessionStorage.getItem("userData");
  const user = userDataString ? JSON.parse(userDataString) : {};
  const userName = user.username || "User";
  const userRole = user.role?.role_name || "User";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="h-screen w-full flex overflow-x-hidden bg-gray-50">
      {/* SIDEBAR */}
      <aside
        className={`fixed bg-white h-full border-r border-gray-200 hidden md:flex flex-col p-4 transition-all duration-300 z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 bg-white border rounded-full p-1 shadow"
        >
          <ChevronLeft
            className={`${collapsed ? "rotate-180" : ""} transition`}
            size={18}
          />
        </button>

        <div className="text-lg font-bold mb-8">
          {collapsed ? "eA" : "eAttend"}
        </div>

        <nav className="space-y-1 text-sm">
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-3 p-2 rounded w-full ${
              isActive("/dashboard")
                ? "text-teal-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <LayoutDashboard size={18} /> {!collapsed && "Dashboard"}
          </button>

          <button
            onClick={() => navigate("/dashboard/all-events")}
            className={`flex items-center gap-3 p-2 rounded w-full ${
              isActive("/dashboard/all-events")
                ? "text-teal-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Calendar size={18} /> {!collapsed && "All Events"}
          </button>

          {/* <button className="flex items-center gap-3 p-2 rounded w-full text-gray-600 hover:bg-gray-100">
            <Users size={18} /> {!collapsed && "Attendees"}
          </button>

          <button className="flex items-center gap-3 p-2 rounded w-full text-gray-600 hover:bg-gray-100">
            <BarChart3 size={18} /> {!collapsed && "Analytics"}
          </button> */}

          <button className="flex items-center gap-3 p-2 rounded w-full text-gray-600 hover:bg-gray-100">
            <Settings size={18} /> {!collapsed && "Settings"}
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* TOP BAR */}
        <header className="flex items-center justify-between p-4 bg-white sticky top-0 z-20 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-900">eAttend</span>
          </div>

          <div className="relative">
            <div
              className="h-10 w-10 rounded-full cursor-pointer bg-teal-600 text-white flex items-center justify-center font-semibold text-sm"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {userInitials}
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border shadow-lg rounded-lg p-3 z-50">
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-gray-500 mb-3">{userRole}</p>
                <button
                  onClick={handleLogout}
                  className="w-full p-2 text-left hover:bg-gray-100 rounded text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
