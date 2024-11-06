// src/components/pages/CommandNotes.js
import React from "react";
import {
  CommandNoteForm,
  CommandNotesList,
} from "../../components/dashboards/CommandNotesDashboard";
import styles from "./CommandNotes.module.css";

function CommandNotes() {
  return (
    <div className={`min-h-screen bg-gray-50`}>
      <div className="flex">
        <div className={`flex-1 ${styles.commandNotesContainer}`}>
          <div className={styles.contentWrapper}>
            <CommandNoteForm />
            <div className={styles.listSection}>
              <CommandNotesList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandNotes;
