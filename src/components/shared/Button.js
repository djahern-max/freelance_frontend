import React from "react";
import styles from "./Button.module.css"; // Import CSS Module

const Button = ({ label }) => {
  return <button className={styles.button}>{label}</button>;
};

export default Button;
