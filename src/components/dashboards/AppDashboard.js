import React, { useState } from "react";
import Header from "../shared/Header";
import { ThumbsUp } from "lucide-react";
import styles from "./AppDashboard.module.css";

const AppDashboard = () => {
  const [applications, setApplications] = useState([
    { id: 1, name: "My Awesome App", url: "https://awesomeapp.com", votes: 42 },
    {
      id: 2,
      name: "Productivity Booster",
      url: "https://productivitybooster.com",
      votes: 35,
    },
    { id: 3, name: "Task Manager", url: "https://taskmanager.com", votes: 27 },
  ]);
  const [newApp, setNewApp] = useState({ name: "", url: "" });

  // Function to increase votes and reorder list based on votes
  const likeApp = (id) => {
    setApplications((prevApplications) => {
      const updatedApps = prevApplications.map((app) =>
        app.id === id ? { ...app, votes: app.votes + 1 } : app
      );
      return updatedApps.sort((a, b) => b.votes - a.votes);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewApp((prev) => ({ ...prev, [name]: value }));
  };

  const addApplication = () => {
    if (!newApp.name || !newApp.url) return;

    const newApplication = {
      id: applications.length + 1,
      name: newApp.name,
      url: newApp.url,
      votes: 0,
    };

    setApplications((prevApps) => [...prevApps, newApplication]);
    setNewApp({ name: "", url: "" });
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.mainContent}>
        <p className={styles.placeholderMessage}>
          This is just placeholder data for now, stay tuned for the completed
          application within a couple of weeks (11.10.2024). The idea is that
          developers can submit their applications and users can vote on them.
          ... and RYZE to the top of the list!
        </p>

        <div className={styles.dashboardGrid}>
          <div className={styles.dashboardCard}>
            <div className={styles.cardContent}>
              {applications.length > 0 ? (
                <ul className={styles.applicationList}>
                  {applications.map((app) => (
                    <li key={app.id} className={styles.applicationItem}>
                      <div className={styles.applicationInfo}>
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.applicationName}
                        >
                          {app.name}
                        </a>
                        <p className={styles.applicationUrl}>{app.url}</p>
                      </div>
                      <div className={styles.voteSection}>
                        <button
                          className={styles.voteButton}
                          onClick={() => likeApp(app.id)}
                        >
                          <ThumbsUp size={18} />
                          <span>{app.votes}</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyState}>No applications listed yet</p>
              )}
            </div>
          </div>

          <div className={styles.dashboardCard}>
            <div className={styles.cardContent}>
              <input
                type="text"
                name="name"
                value={newApp.name}
                onChange={handleInputChange}
                placeholder="Application Name"
                className={styles.inputField}
              />
              <input
                type="text"
                name="url"
                value={newApp.url}
                onChange={handleInputChange}
                placeholder="Application URL"
                className={styles.inputField}
              />
              <button className={styles.primaryButton} onClick={addApplication}>
                Add Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDashboard;
