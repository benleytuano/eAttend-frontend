import { redirect } from "react-router";

export default function rootLayoutLoader() {
  const token = sessionStorage.getItem("authToken");

  if (!token) {
    return redirect("/");
  }

  return null;
}
