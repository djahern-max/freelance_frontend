import React from "react";
import Header from "../shared/Header";
import styles from "./AppDashboard.module.css";

const AppDashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.headerContainer}>
        <Header />
      </div>
      <h1>App Dashboard</h1>
      {/* Add your dashboard content sections here */}
      <div className={styles.dashboardContent}>
        {/* Example structure - modify based on your needs */}
        <div className={styles.dashboardSection}>
          {/* Add your dashboard widgets/components here */}
        </div>
      </div>
    </div>
  );
};

export default AppDashboard;
