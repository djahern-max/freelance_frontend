import React from "react";
import Header from "../shared/Header";
import { Layout, Grid, ChartLine, Users, FileText } from "lucide-react";
import styles from "./AppDashboard.module.css";

const AppDashboard = () => {
  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>App Dashboard</h1>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FileText size={24} />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statTitle}>Total Requests</h3>
              <p className={styles.statValue}>24</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={24} />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statTitle}>Active Users</h3>
              <p className={styles.statValue}>12</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <ChartLine size={24} />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statTitle}>Response Rate</h3>
              <p className={styles.statValue}>89%</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Layout size={24} />
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statTitle}>Projects</h3>
              <p className={styles.statValue}>8</p>
            </div>
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          <div className={styles.dashboardCard}>
            <h2 className={styles.cardTitle}>Recent Activity</h2>
            <div className={styles.cardContent}>
              {/* Add activity content here */}
              <p className={styles.emptyState}>No recent activity</p>
            </div>
          </div>

          <div className={styles.dashboardCard}>
            <h2 className={styles.cardTitle}>Quick Actions</h2>
            <div className={styles.cardContent}>
              {/* Add quick actions here */}
              <div className={styles.actionButtons}>
                <button className={styles.actionButton}>Create Request</button>
                <button className={styles.actionButton}>Upload Video</button>
                <button className={styles.actionButton}>View Projects</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDashboard;
