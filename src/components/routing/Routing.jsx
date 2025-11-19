// src/components/routing/Routing.jsx
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Dashboard from "../dashboard/Dashboard";
import Categories from "../categories/Categories";
import Login from "../login/Login";
import Signup from "../login/Signup";
import Products from "../products/Products";
import Profile from "../profile/Profile";
import Suppliers from "../supplier/Suppliers";
import Layout from "./Layout";
import Forgot from "../login/Forgot";
import SubCategories from "../subcategories/SubCategories";
import Purchase from "../parchase/Purchase";

import { RequireAuth, RedirectIfAuth } from "./RequireAuth";

const router = createBrowserRouter([
  // redirect root → login
  { path: "/", element: <Navigate to="/login" replace /> },

  {
    path: "/login",
    element: (
      <RedirectIfAuth>
        <Login />
      </RedirectIfAuth>
    ),
  },
  {
    path: "/signup",
    element: (
      <RedirectIfAuth>
        <Signup />
      </RedirectIfAuth>
    ),
  },
  {
    path: "/forgot",
    element: (
      <RedirectIfAuth>
        <Forgot />
      </RedirectIfAuth>
    ),
  },

  {
    path: "/app",
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "purchase", element: <Purchase /> },
      { path: "categories", element: <Categories /> },
      {
        path: "subcategories",
        element: <SubCategories />,
      },
      { path: "products", element: <Products /> },
      { path: "suppliers", element: <Suppliers /> },
      { path: "profile", element: <Profile /> },
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default function Routing() {
  return <RouterProvider router={router} />;
}
