import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./PublicRequests.module.css";
import Header from "../shared/Header";

const apiUrl = process.env.REACT_APP_API_URL;

const PublicRequests = () => {
  const [publicRequests, setPublicRequests] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicRequests = async () => {
      try {
        const response = await axios.get(`${apiUrl}/requests/public`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Ensure token is stored in local storage
          },
        });
        setPublicRequests(response.data);
      } catch (err) {
        console.error("Error fetching public requests:", err);
        setError("Failed to fetch public requests.");
      }
    };
    fetchPublicRequests();
  }, []);

  return (
    <div className={styles.publicRequestsContainer}>
      {/* Header navigation */}
      <Header />

      <h1>Public Requests</h1>
      {error && <p className={styles.error}>{error}</p>}
      {publicRequests.length > 0 ? (
        <ul className={styles.requestList}>
          {publicRequests.map((request) => (
            <li key={request.id} className={styles.requestItem}>
              <h2>{request.title}</h2>
              <p>{request.content}</p>
              <p>Project ID: {request.project_id}</p>
              {/* Additional request details here as needed */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No public requests available at this time.</p>
      )}
    </div>
  );
};

export default PublicRequests;
