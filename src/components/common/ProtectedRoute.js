// src/components/common/ProtectedRoute.js
import React, { useEffect } from "react"; // Added React and useEffect
import { useSelector } from "react-redux"; // Added useSelector
import { useNavigate } from "react-router-dom"; // Added useNavigate

const ProtectedRoute = ({ userType, children }) => {
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();

  console.log("Protected Route - User Type Required:", userType);
  console.log("Protected Route - Current User:", auth.user);

  useEffect(() => {
    if (!auth.token) {
      navigate("/login");
    } else if (userType && auth.user?.userType !== userType) {
      console.log("User type mismatch:", {
        required: userType,
        current: auth.user?.userType,
      });
      navigate(
        auth.user?.userType === "client"
          ? "/client-dashboard"
          : "/developer-dashboard"
      );
    }
  }, [auth, userType, navigate]);

  return auth.token ? children : null;
};

export default ProtectedRoute;
