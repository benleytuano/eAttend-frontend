import { redirect } from "react-router";

export default function dashboardLoader() {
  const token = sessionStorage.getItem("authToken");

  if (!token) {
    return redirect("/");
  }

  return null;
}
