import { redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import axiosInstance from "../../../services/api";

export default async function loginPostAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const rememberMe = formData.get("rememberMe");

  try {
    const response = await axiosInstance.post("/users/login", {
      email,
      password,
      rememberMe: !!rememberMe,
    });

    console.log(response);

    const { token } = response.data;
    sessionStorage.setItem("authToken", token);

    // Redirect based on user role if needed
    if (response.data.user?.role?.id !== 3) {
      return redirect("/dashboard");
    } else {
      return redirect("/end-user-dashboard");
    }
  } catch (error: any) {
    console.error(error);
    return { error: error.response?.data?.message || "Login failed" };
  }
}
