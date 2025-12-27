import { createBrowserRouter } from "react-router";

import RootLayout from "../layouts/RootLayout";
import rootLayoutLoader from "../layouts/Loader/rootLayoutLoader";
import Dashboard from "../pages/Dashboard/Dashboard";
import dashboardLoader from "../pages/Dashboard/Loader/dashboardLoader";
import { addEventAction } from "../pages/Dashboard/Actions/addEventAction";
import AllEvents from "../pages/Dashboard/AllEvents";
import EventDetails from "../pages/Dashboard/EventDetails";
import Login from "../pages/Login/Login";
import loginPostAction from "../pages/Login/Actions/postAction";
import Register from "../pages/Register/Register";

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
      },
      {
        path: "events/:eventId",
        Component: EventDetails,
      },
    ],
  },
]);
