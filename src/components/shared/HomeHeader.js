import React from "react";
import styles from "./HomeHeader.module.css";

const HomeHeader = () => {
  return (
    <header className={styles.homeHeader}>
      <h1 className={styles.homeHeaderTitle}>RYZE.ai</h1>
    </header>
  );
};

export default HomeHeader;
