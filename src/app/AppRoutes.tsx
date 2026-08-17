import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';
import ProtectedRoutes from '@/navigation/ProtectedRoutes';
import ErrorPage from '@/components/common/ErrorPage';

// Import Feature Authentication Screens
import LoginForm from '@/features/auth/components/LoginForm';
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';
import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm';

// Import Dashboard Feature Screens
import DashboardScreen from '@/features/dashboard/screens/DashboardScreen';
import UserListScreen from '@/features/users/screens/UserListScreen';

// Import Products Feature Screens
import ProductListScreen from '@/features/products/screens/ProductListScreen';
import ProductDetailsScreen from '@/features/products/screens/ProductDetailsScreen';
import InventoryListScreen from '@/features/inventory/screens/InventoryListScreen';

// Import Suppliers & Purchases Feature Screens
import SupplierListScreen from '@/features/suppliers/screens/SupplierListScreen';
import PurchaseListScreen from '@/features/purchases/screens/PurchaseListScreen';
import PurchaseFormScreen from '@/features/purchases/screens/PurchaseFormScreen';
import PurchaseDetailsScreen from '@/features/purchases/screens/PurchaseDetailsScreen';

// Import Customers & Sales Feature Screens
import CustomerListScreen from '@/features/customers/screens/CustomerListScreen';
import SaleListScreen from '@/features/sales/screens/SaleListScreen';
import SaleFormScreen from '@/features/sales/screens/SaleFormScreen';
import SaleDetailsScreen from '@/features/sales/screens/SaleDetailsScreen';
import ExpenseListScreen from '@/features/expenses/screens/ExpenseListScreen';
import ReportsScreen from '@/features/reports/screens/ReportsScreen';
import SettingsPage from '@/features/settings/SettingsPage';
import ProfilePage from '@/features/profile/ProfilePage';
import OrderListScreen from '@/features/orders/screens/OrderListScreen';
import SlideManagementScreen from '@/features/slides/screens/SlideManagementScreen';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginForm />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordForm />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordForm />} />
      </Route>

      {/* Protected Admin Workspace Routes */}
      <Route element={<AppLayout />}>
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoutes requiredPermission="dashboard:read">
              <DashboardScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.PRODUCTS}
          element={
            <ProtectedRoutes requiredPermission="products:read">
              <ProductListScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoutes requiredPermission="products:read">
              <ProductDetailsScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.INVENTORY}
          element={
            <ProtectedRoutes requiredPermission="inventory:read">
              <InventoryListScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.PURCHASES}
          element={
            <ProtectedRoutes requiredPermission="purchases:read">
              <PurchaseListScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/purchases/new"
          element={
            <ProtectedRoutes requiredPermission="purchases:create">
              <PurchaseFormScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/purchases/:id/edit"
          element={
            <ProtectedRoutes requiredPermission="purchases:create">
              <PurchaseFormScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/purchases/:id"
          element={
            <ProtectedRoutes requiredPermission="purchases:read">
              <PurchaseDetailsScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.ORDERS}
          element={
            <ProtectedRoutes requiredPermission="sales:read">
              <OrderListScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.SALES}
          element={
            <ProtectedRoutes requiredPermission="sales:read">
              <SaleListScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/sales/new"
          element={
            <ProtectedRoutes requiredPermission="sales:create">
              <SaleFormScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/sales/:id/edit"
          element={
            <ProtectedRoutes requiredPermission="sales:create">
              <SaleFormScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/sales/:id"
          element={
            <ProtectedRoutes requiredPermission="sales:read">
              <SaleDetailsScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.CUSTOMERS}
          element={
            <ProtectedRoutes requiredPermission="customers:read">
              <CustomerListScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.SUPPLIERS}
          element={
            <ProtectedRoutes requiredPermission="suppliers:read">
              <SupplierListScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.EXPENSES}
          element={
               <ProtectedRoutes requiredPermission="expenses:read">
                 <ExpenseListScreen />
               </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.REPORTS}
          element={
            <ProtectedRoutes requiredPermission="reports:view">
              <ReportsScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoutes requiredPermission="settings:read">
              <SettingsPage />
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.SLIDES}
          element={
            <ProtectedRoutes requiredPermission="products:update">
              <SlideManagementScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.STAFF}
          element={
            <ProtectedRoutes requiredPermission="users:read">
              <UserListScreen />
            </ProtectedRoutes>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoutes>
              <ProfilePage />
            </ProtectedRoutes>
          }
        />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<ErrorPage status={404} title="Page Not Found" message="The page you requested does not exist or you entered an invalid URL path." />} />
    </Routes>
  );
};

export default AppRoutes;
