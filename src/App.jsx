import { createHashRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "react-hot-toast";
import ErrorPage from "./pages/ErrorPage";
import Dashboard from "./pages/Dashboard";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  const router = createHashRouter([
    {
      path: "/",
      errorElement: <ErrorPage />,
      children: [
        // Public (login)
        { index: true, element: <LoginPage /> },

        // Protected routes
        {
          element: <RequireAuth />,
          children: [{ path: "dashboard", element: <Dashboard /> }],
        },
      ],
    },
  ]);
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <RouterProvider router={router} />
    </>
  );
}
