import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import styles from "./CommandDisplay.module.css";

const CommandDisplay = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className={styles.noteContainer}>
      <div className={styles.noteContent}>{text}</div>
      <button
        onClick={handleCopy}
        className={styles.copyButton}
        title={copied ? "Copied!" : "Copy note"}
      >
        {copied ? (
          <Check className={styles.successIcon} />
        ) : (
          <Copy className={styles.copyIcon} />
        )}
      </button>
    </div>
  );
};

export default CommandDisplay;
