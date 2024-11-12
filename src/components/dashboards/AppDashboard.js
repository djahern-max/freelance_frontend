import React, { useState } from "react";
import Header from "../shared/Header";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import styles from "./AppDashboard.module.css";

const AppDashboard = () => {
  const [applications, setApplications] = useState([
    {
      id: 1,
      name: "Processmaker",
      url: "https://www.processmaker.com/",
      votes: 44,
      downvotes: 1,
    },
    {
      id: 2,
      name: "ConnexAI",
      url: "https://athena.connex.ai/",
      votes: 21,
      downvotes: 0,
    },
    {
      id: 3,
      name: "LIVEPERSON",
      url: "https://www.liveperson.com/",
      votes: 23,
      downvotes: 3,
    },
    {
      id: 4,
      name: "ElectroNeek",
      url: "https://electroneek.com/",
      votes: 17,
      downvotes: 0,
    },
    { id: 5, name: "PolyAI", url: "https://poly.ai/", votes: 16, downvotes: 0 },
    {
      id: 6,
      name: "ETQ Reliance",
      url: "https://www.etq.com/",
      votes: 42,
      downvotes: 34,
    },
    {
      id: 7,
      name: "QT9 QMS",
      url: "https://qt9qms.com/",
      votes: 41,
      downvotes: 33,
    },
    {
      id: 8,
      name: "MasterControl Quality Excellence",
      url: "https://www.mastercontrol.com/",
      votes: 49,
      downvotes: 45,
    },
  ]);

  const [newApp, setNewApp] = useState({ name: "", url: "" });

  const likeApp = (id) => {
    setApplications((prevApplications) => {
      const updatedApps = prevApplications.map((app) =>
        app.id === id ? { ...app, votes: app.votes + 1 } : app
      );
      return updatedApps.sort(
        (a, b) => b.votes - b.downvotes - (a.votes - a.downvotes)
      );
    });
  };

  const dislikeApp = (id) => {
    setApplications((prevApplications) => {
      const updatedApps = prevApplications.map((app) =>
        app.id === id ? { ...app, downvotes: app.downvotes + 1 } : app
      );
      return updatedApps.sort(
        (a, b) => b.votes - b.downvotes - (a.votes - a.downvotes)
      );
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
      downvotes: 0,
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
                  {applications.map((app, index) => (
                    <li
                      key={app.id}
                      className={`${styles.applicationItem} ${
                        index < 2
                          ? styles.topRankGreen
                          : index < 4
                          ? styles.topRankYellow
                          : index < 6
                          ? styles.topRankRed
                          : ""
                      }`}
                    >
                      <div className={styles.applicationInfo}>
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.applicationName}
                        >
                          {app.name}
                        </a>
                        <p className={styles.applicationUrl}>
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                          >
                            {app.url}
                          </a>
                        </p>
                      </div>
                      <div className={styles.voteSection}>
                        <button
                          className={styles.voteButton}
                          onClick={() => likeApp(app.id)}
                        >
                          <ThumbsUp size={18} />
                          <span>{app.votes}</span>
                        </button>
                        <button
                          className={styles.voteButton}
                          onClick={() => dislikeApp(app.id)}
                        >
                          <ThumbsDown size={18} />
                          <span>{app.downvotes}</span>
                        </button>
                        {index === 0 ? (
                          <span className={styles.rankLabel}> Winner!</span>
                        ) : index === 1 ? (
                          <span className={styles.rankLabel}> Runner Up!</span>
                        ) : index === 2 ? (
                          <span className={styles.rankLabel}>
                            {" "}
                            Third Place!
                          </span>
                        ) : null}
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
