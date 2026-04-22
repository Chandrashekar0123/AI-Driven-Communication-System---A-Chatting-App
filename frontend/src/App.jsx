import React, { Suspense, useEffect, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useThemeStore } from "./store/useThemeStore";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";

import Navbar from "./components/layout/Navbar";
const HomePage = lazy(() => import("./pages/HomePage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { subscribeToSocket, unsubscribeFromSocket } = useChatStore();
  const { theme } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Global socket subscription when logged in and socket is ready
  useEffect(() => {
    if (authUser && socket) {
      subscribeToSocket();
      return () => unsubscribeFromSocket();
    }
  }, [authUser, socket, subscribeToSocket, unsubscribeFromSocket]);

  if (isCheckingAuth && !authUser)
    return <div className="min-h-screen bg-[#1E1F22]" />;

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isChatPage = location.pathname === "/";

  return (
    <div data-theme={theme} className="min-h-screen antialiased transition-colors duration-300">
      {/* Hide Navbar on Chat and Auth pages */}
      {!isChatPage && !isAuthPage && <Navbar />}

      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
      </Suspense>

      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#2B2D31',
            color: '#DBDEE1',
            border: '1px solid rgba(255,255,255,0.05)',
            fontSize: '13px',
          },
        }}
      />
    </div>
  );
};
export default App;
