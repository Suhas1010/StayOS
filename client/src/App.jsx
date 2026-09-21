import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

// Pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { VerifyEmail } from "./pages/auth/VerifyEmail";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { PropertiesList } from "./pages/properties/PropertiesList";
import { PropertyDetails } from "./pages/properties/PropertyDetails";
import { RoomsPage } from "./pages/rooms/RoomsPage";
import { TenantsPage } from "./pages/tenants/TenantsPage";
import { RentPage } from "./pages/rent/RentPage";
import { ComplaintsPage } from "./pages/complaints/ComplaintsPage";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:verificationToken" element={<VerifyEmail />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected Routes enclosed in AppLayout shell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Owner and Caretaker Routes */}
              <Route
                path="/properties"
                element={
                  <ProtectedRoute allowedRoles={["OWNER", "CARETAKER"]}>
                    <PropertiesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/:propertyId"
                element={
                  <ProtectedRoute allowedRoles={["OWNER", "CARETAKER"]}>
                    <PropertyDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rooms"
                element={
                  <ProtectedRoute allowedRoles={["OWNER", "CARETAKER"]}>
                    <RoomsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenants"
                element={
                  <ProtectedRoute allowedRoles={["OWNER", "CARETAKER"]}>
                    <TenantsPage />
                  </ProtectedRoute>
                }
              />

              {/* Accessible by All Roles (Adaptive Views) */}
              <Route path="/rent" element={<RentPage />} />
              <Route path="/complaints" element={<ComplaintsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
