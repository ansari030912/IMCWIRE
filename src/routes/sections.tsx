// TypeScript Imports
import type { ReactNode } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import Cookies from 'js-cookie';
// eslint-disable-next-line import/no-duplicates
import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// Lazy-loaded components
const HomePage = lazy(() => import('src/pages/home'));
const BlogPage = lazy(() => import('src/pages/blog'));
const UserPage = lazy(() => import('src/pages/user'));
const SignInPage = lazy(() => import('src/pages/sign-in'));
const SignUpPage = lazy(() => import('src/pages/sign-up'));
const ProductsPage = lazy(() => import('src/pages/products'));
const Page404 = lazy(() => import('src/pages/page-not-found'));

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

// Authentication Guard for protected routes (Dashboard, etc.)
function PrivateRoute({ children }: RouteGuardProps) {
  const userData = Cookies.get('userData') ? JSON.parse(Cookies.get('userData') || '{}') : null;
  const isAuthenticated = userData && userData.user === 'active' && userData.isLogin === true;

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Admin Route Guard (Only Allows Admins)
function AdminRoute({ children }: RouteGuardProps) {
  const userData = Cookies.get('userData') ? JSON.parse(Cookies.get('userData') || '{}') : null;
  const isAdmin = userData && userData.role === 'admin' && userData.isLogin === true;

  return isAdmin ? <>{children}</> : <Navigate to="/" replace />; // Redirect non-admins to home
}

// Public Route for Login/Register (only accessible when NOT logged in)
function PublicRoute({ children }: RouteGuardProps) {
  const userData = Cookies.get('userData') ? JSON.parse(Cookies.get('userData') || '{}') : null;
  const isAuthenticated = userData && userData.user === 'active' && userData.isLogin === true;

  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

// Router function
export function Router() {
  return useRoutes([
    {
      element: (
        <PrivateRoute>
          <DashboardLayout>
            <Suspense fallback={renderFallback}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </PrivateRoute>
      ),
      children: [
        { element: <HomePage />, index: true },
        { path: 'press-release', element: <UserPage /> },
        { path: 'add-press-release', element: <ProductsPage /> },
        { path: 'reports', element: <BlogPage /> },
        { path: 'transactions', element: <ProductsPage /> },
        { path: 'faqs', element: <ProductsPage /> },
        { path: 'how-it-works', element: <BlogPage /> },

        // Admin Only Routes (Protected with AdminRoute)
        {
          element: <AdminRoute><Outlet /></AdminRoute>,
          children: [
            { path: 'packages', element: <UserPage /> },
            { path: 'companies', element: <BlogPage /> },
            { path: 'add-company', element: <UserPage /> },
          ],
        },
      ],
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
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
