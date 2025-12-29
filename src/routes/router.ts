import { createBrowserRouter } from "react-router";

import RootLayout from "../layouts/RootLayout";
import rootLayoutLoader from "../layouts/Loader/rootLayoutLoader";
import Dashboard from "../pages/Dashboard/Dashboard";
import dashboardLoader from "../pages/Dashboard/Loader/dashboardLoader";
import { addEventAction } from "../pages/Dashboard/Actions/addEventAction";
import AllEvents from "../pages/Dashboard/AllEvents";
import allEventsLoader from "../pages/Dashboard/Loader/allEventsLoader";
import EventDetails from "../pages/Dashboard/EventDetails";
import eventDetailsLoader from "../pages/Dashboard/Loader/eventDetailsLoader";
import { updateEventAction } from "../pages/Dashboard/Actions/updateEventAction";
import { deleteEventAction } from "../pages/Dashboard/Actions/deleteEventAction";
import { uploadAttendeesAction } from "../pages/Dashboard/Actions/uploadAttendeesAction";
import Login from "../pages/Login/Login";
import loginPostAction from "../pages/Login/Actions/postAction";
import Register from "../pages/Register/Register";
import CheckInPage from "../pages/Attendance/CheckInPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
    action: loginPostAction,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/attendance/scan",
    Component: CheckInPage,
  },
  {
    id: "root",
    path: "/dashboard",
    Component: RootLayout,
    loader: rootLayoutLoader,
    children: [
      {
        index: true,
        Component: Dashboard,
        loader: dashboardLoader,
        action: addEventAction,
      },
      {
        path: "all-events",
        Component: AllEvents,
        loader: allEventsLoader,
      },
      {
        path: "events/:eventId",
        Component: EventDetails,
        loader: eventDetailsLoader,
        action: updateEventAction,
      },
      {
        path: "events/:eventId/delete",
        action: deleteEventAction,
      },
      {
        path: "events/:eventId/upload-attendees",
        action: uploadAttendeesAction,
      },
    ],
  },
]);
