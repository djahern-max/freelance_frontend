import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";

const AuthChecker = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("authToken");
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
            dispatch(login({ token, username: data.username }));
          } else {
            // If token is invalid, clear it
            localStorage.removeItem("authToken");
          }
        } catch (error) {
          console.error("Error validating token:", error);
          localStorage.removeItem("authToken");
        }
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  return null;
};

export default AuthChecker;
