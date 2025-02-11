/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ReactNode } from 'react';

import Cookies from 'js-cookie';
import { lazy, useMemo, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// Lazy-loaded components
const HomePage = lazy(() => import('src/pages/home'));
const SignInPage = lazy(() => import('src/pages/sign-in'));
const SignUpPage = lazy(() => import('src/pages/sign-up'));
const ProductsPage = lazy(() => import('src/pages/products'));
const Page404 = lazy(() => import('src/pages/page-not-found'));
const AddCompaniesPage = lazy(() => import('src/pages/add-companies'));
const AddCuponsPage = lazy(() => import('src/pages/add-coupon-admin'));
const AddFaqsPage = lazy(() => import('src/pages/add-faq-admin'));
const AddPackagesPage = lazy(() => import('src/pages/add-packages-admin'));
const AddPressReleasePage = lazy(() => import('src/pages/add-press-release'));
const AllTransactionsAdminPage = lazy(() => import('src/pages/all-transactions-admin'));
const CompaniesPage = lazy(() => import('src/pages/companies'));
const FaqsPage = lazy(() => import('src/pages/faq'));
const HowItWorkage = lazy(() => import('src/pages/how-it-works'));
const PressReleasePage = lazy(() => import('src/pages/press-release'));
const TransactionPage = lazy(() => import('src/pages/transactions'));
const CustomPlanCheckOutPage = lazy(() => import('src/pages/custom-checkout'));
const ResetPasswordPage = lazy(() => import('src/pages/reset-password'));
const ForgotPage = lazy(() => import('src/pages/forgot-password'));

const SettingPage = lazy(() => import('src/pages/setting'));
const ReportsPage = lazy(() => import('src/pages/reports'));
const UserPage = lazy(() => import('src/pages/user'));
const PlanPurchasePage = lazy(() => import('src/pages/plan-purchase'));
const AddVideosPage = lazy(() => import('src/pages/add-videos'));
const PlansPage = lazy(() => import('src/pages/plans'));
const AdminCustomPlanPage = lazy(() => import('src/pages/add-custom-plan'));
const AllOrdersAdminPage = lazy(() => import('src/pages/all-orders'));
// Loading fallback
const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

// Type for route guards
interface RouteGuardProps {
  children: ReactNode;
}

// Authentication Hook
function useAuth() {
  return useMemo(() => {
    const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
    if (!user) return { isAuthenticated: false };
    return {
      isAuthenticated: !!(user.token && user.message === 'Login successful' && user.isActive),
      isUser: user?.role === 'user',
      isAdmin: user?.role === 'admin',
      isSuperAdmin: user?.role === 'super_admin',
      user,
    };
  }, []);
}

// Route Guards
function PrivateRoute({ children }: RouteGuardProps) {
  const auth = useAuth();
  return auth.isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Public Route Guard
function PublicRoute({ children }: RouteGuardProps) {
  const auth = useAuth();
  return auth.isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

// Get Routes Based on Role
function useRoutesByRole() {
  const auth = useAuth();
  if (auth.isUser) {
    return [
      { element: <HomePage />, index: true },
      { path: 'add-press-release', element: <AddPressReleasePage /> },
      { path: 'transactions', element: <TransactionPage /> },
      { path: 'press-release', element: <PressReleasePage /> },
      { path: 'faqs', element: <FaqsPage /> },
      { path: 'how-it-works', element: <HowItWorkage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'packages', element: <ProductsPage /> },
      { path: 'add-company', element: <AddCompaniesPage /> },
      { path: 'purchase/:id', element: <PlanPurchasePage /> },
      { path: 'plans', element: <PlansPage /> },
      { path: 'setting', element: <SettingPage /> },
      {
        path: 'custom-invoice/:id',
        element: <CustomPlanCheckOutPage />,
      },
    ];
  }

  if (auth.isAdmin) {
    return [
      { element: <HomePage />, index: true },
      // { path: 'press-release', element: <PressReleasePage /> },
      { path: 'all-transactions', element: <AllTransactionsAdminPage /> },
      { path: 'users', element: <UserPage /> },
      { path: 'add-faqs', element: <AddFaqsPage /> },
      { path: 'packages', element: <ProductsPage /> },
      { path: 'add-packages', element: <AddPackagesPage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'add-coupons', element: <AddCuponsPage /> },
      { path: 'add-videos', element: <AddVideosPage /> },
      { path: 'add-custom-invoice', element: <AdminCustomPlanPage /> },
      { path: 'setting', element: <SettingPage /> },
      {
        path: 'custom-invoice/:id',
        element: <CustomPlanCheckOutPage />,
      },
    ];
  }

  if (auth.isSuperAdmin) {
    return [
      { element: <HomePage />, index: true },
      // { path: 'press-release', element: <PressReleasePage /> },
      { path: 'all-transactions', element: <AllTransactionsAdminPage /> },
      { path: 'all-orders', element: <AllOrdersAdminPage /> },
      { path: 'add-faqs', element: <AddFaqsPage /> },
      { path: 'add-packages', element: <AddPackagesPage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'add-coupons', element: <AddCuponsPage /> },
      { path: 'users', element: <UserPage /> },
      { path: 'add-videos', element: <AddVideosPage /> },
      { path: 'add-custom-invoice', element: <AdminCustomPlanPage /> },
      { path: 'setting', element: <SettingPage /> },
      {
        path: 'custom-invoice/:id',
        element: <CustomPlanCheckOutPage />,
      },
    ];
  }

  return [];
}

// Router function
export function Router() {
  const auth = useAuth(); // Get authentication status
  const routesByRole = useRoutesByRole();

  return useRoutes([
    {
      path: '/',
      element: auth.isAuthenticated ? (
        <PrivateRoute>
          <DashboardLayout>
            <Suspense fallback={renderFallback}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </PrivateRoute>
      ) : (
        <Navigate to="/login" replace />
      ),
      children: [{ index: true, element: <HomePage /> }],
    },
    {
      path: 'login',
      element: (
        <PublicRoute>
          <AuthLayout>
            <SignInPage />
          </AuthLayout>
        </PublicRoute>
      ),
    },
    {
      path: 'register',
      element: (
        <PublicRoute>
          <AuthLayout>
            <SignUpPage />
          </AuthLayout>
        </PublicRoute>
      ),
    },
    {
      path: 'forgot-password',
      element: (
        <PublicRoute>
          <AuthLayout>
            <ForgotPage />
          </AuthLayout>
        </PublicRoute>
      ),
    },
    {
      path: 'reset-password',
      element: (
        <PublicRoute>
          <AuthLayout>
            <ResetPasswordPage />
          </AuthLayout>
        </PublicRoute>
      ),
    },
    { path: '404', element: <Page404 /> },
    { path: '*', element: <Navigate to="/404" replace /> },
    {
      path: 'custom-invoice/:id',
      element: (
        <div>
          <br />
          <br />
          <br />
          <CustomPlanCheckOutPage />
        </div>
      ),
    },
    {
      path: 'purchase/:id',
      element: (
        <div>
          <br />
          <br />
          <br />
          <PlanPurchasePage />
        </div>
      ),
    },
  ]);
}
