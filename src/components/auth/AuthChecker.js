import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import { useLocation } from "react-router-dom";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/home',
  '/login',
  '/register',
  '/oauth/callback',
  '/auth/github/callback',
  '/auth/google/callback',
  '/terms',
  '/privacy'
];

const AuthChecker = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Always use consistent token key - 'token' based on your authSlice
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Validate token with your backend
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/validate-token`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            dispatch(login({ token, user: data }));
          } else {
            // If token is invalid, clear it but don't redirect if on public route
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Error validating token:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } else if (!isPublicRoute) {
        // Only store redirect info if not on a public route
        // Store current path for redirect after login
        sessionStorage.setItem('redirectAfterLogin', location.pathname);
      }
    };

    checkAuthStatus();
  }, [dispatch, isPublicRoute, location.pathname]);

  return null;
};

export default AuthChecker;