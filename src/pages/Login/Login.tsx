import { Form, useActionData, useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();
  const actionData = useActionData() as { error?: string } | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">eAttend</h1>
          <p className="text-gray-600 text-sm mt-2">Sign in to your account</p>
        </div>

        <Form method="post" className="space-y-4">
          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {actionData.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-700 text-white py-2 rounded font-medium hover:bg-teal-800 transition"
          >
            Sign In
          </button>
        </Form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-teal-700 font-medium hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
