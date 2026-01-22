import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout Components
import MainLayout from './components/common/Layout/MainLayout';
import AuthLayout from './components/common/Layout/AuthLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Landing / Public pages
import LandingPage from './pages/Landing/LandingPage';
import Pricing from './pages/Pricing/Pricing';
import Demo from './pages/Demo/Demo';

// Main Pages
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets/Assets';
import AssetDetail from './pages/Assets/AssetDetail';
import AssetForm from './components/assets/AssetForm';
import WorkOrders from './pages/WorkOrders/WorkOrders';
import MyAssignments from './pages/WorkOrders/MyAssignments';
import WorkOrderDetail from './pages/WorkOrders/WorkOrderDetail';
import WorkOrderCreate from './pages/WorkOrders/WorkOrderCreate';
import PreventiveMaintenance from './pages/PreventiveMaintenance/PreventiveMaintenance';
import Vendors from './pages/Vendors/Vendors';
import VendorForm from './pages/Vendors/VendorForm';
import VendorImport from './pages/Vendors/VendorImport';
import VendorPortal from './pages/Vendors/VendorPortal';
import TechnicianPortal from './pages/Technicians/TechnicianPortal';
import StaffPortal from './pages/Staff/StaffPortal';
import FinancePortal from './pages/Finance/FinancePortal';
import ServiceRequests from './pages/ServiceRequests/ServiceRequests';
import ServiceRequestForm from './pages/ServiceRequests/ServiceRequestForm';
import Inventory from './pages/Inventory/Inventory';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Settings/Profile';

// Role-based route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
      <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
      
      {/* Public landing page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/demo" element={<Demo />} />

      {/* Protected Routes (dashboard accessible at /dashboard) */}
      
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin"]}>
          <MainLayout><Dashboard /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/assets" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin", "technician"]}>
          <MainLayout><Assets /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/assets/new" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin"]}>
          <MainLayout><AssetForm /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/assets/:id/edit" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin"]}>
          <MainLayout><AssetForm /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/assets/:id" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin", "technician"]}>
          <MainLayout><AssetDetail /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/work-orders" element={
        <ProtectedRoute>
          <MainLayout><WorkOrders /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/work-orders/new" element={
        <ProtectedRoute>
          <MainLayout><WorkOrderCreate /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/work-orders/my-assignments" element={
        <ProtectedRoute>
          <MainLayout><MyAssignments /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/work-orders/:id" element={
        <ProtectedRoute>
          <MainLayout><WorkOrderDetail /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/preventive-maintenance" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin"]}>
          <MainLayout><PreventiveMaintenance /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/vendors" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin", "procurement"]}>
          <MainLayout><Vendors /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/vendors/new" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin", "procurement"]}>
          <MainLayout><VendorForm /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/vendors/:id/edit" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin", "procurement"]}>
          <MainLayout><VendorForm /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/vendors/import" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin", "procurement"]}>
          <MainLayout><VendorImport /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/vendor-portal" element={
        <ProtectedRoute allowedRoles={["vendor"]}>
          <MainLayout><VendorPortal /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/technician-portal" element={
        <ProtectedRoute allowedRoles={["technician", "admin"]}>
          <MainLayout><TechnicianPortal /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/staff-portal" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin", "staff"]}>
          <MainLayout><StaffPortal /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/finance-portal" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin", "finance"]}>
          <MainLayout><FinancePortal /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/service-requests" element={
        <ProtectedRoute>
          <MainLayout><ServiceRequests /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/service-requests/new" element={
        <ProtectedRoute>
          <MainLayout><ServiceRequestForm /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin", "technician"]}>
          <MainLayout><Inventory /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={["facility_manager", "admin", "finance"]}>
          <MainLayout><Reports /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout><Settings /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout><Profile /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/unauthorized" element={
        <AuthLayout>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Access Denied</h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>You don't have permission to access this page.</p>
            <button onClick={() => window.location.href = '/dashboard'} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4F46E5', color: 'white', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem', border: 'none' }}>
              Go to Dashboard
            </button>
          </div>
        </AuthLayout>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
