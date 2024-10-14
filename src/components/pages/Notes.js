import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Notes.module.css";
import newsIcon from "../../images/news.png";
import notesIcon from "../../images/Notes.png";
import appsIcon from "../../images/Apps.png";
import logoutIcon from "../../images/Logout.png";

const API_URL = process.env.REACT_APP_API_URL;

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editNoteId, setEditNoteId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get token from localStorage
  const token = localStorage.getItem("authToken");

  // Fetch notes when component mounts
  useEffect(() => {
    if (!token) {
      setError("Token not found. Please log in again.");
      return;
    }
    fetchNotes();
  }, [token]);

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/notes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotes(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  // Create a new note
  const createNote = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/notes/`,
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTitle("");
      setContent("");
      fetchNotes();
    } catch (error) {
      handleError(error);
    }
  };

  // Edit an existing note
  const editNote = (note) => {
    setEditMode(true);
    setEditNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  // Update a note
  const updateNote = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/notes/${editNoteId}`,
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setEditMode(false);
      setEditNoteId(null);
      setTitle("");
      setContent("");
      fetchNotes();
    } catch (error) {
      handleError(error);
    }
  };

  // Delete a note
  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/notes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchNotes();
    } catch (error) {
      handleError(error);
    }
  };

  // Error handler for token-related issues
  const handleError = (error) => {
    if (error.response && error.response.status === 401) {
      setError("Unauthorized. Please log in again.");
    } else {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.notesContainer}>
      {/* Header navigation like in Videos.js */}
      <div className={styles["icon-bar"]}>
        <img
          src={newsIcon}
          alt="News"
          title="Go to News"
          className={styles.icon}
          onClick={() => navigate("/newsletter-dashboard")}
        />
        <img
          src={notesIcon}
          alt="Notes"
          title="Go to Notes"
          className={styles.icon}
          onClick={() => navigate("/notes")}
        />
        <img
          src={appsIcon}
          alt="Projects"
          title="Go to Projects"
          className={styles.icon}
          onClick={() => navigate("/app-dashboard")}
        />
        <img
          src={logoutIcon}
          alt="Logout"
          title="Logout"
          className={styles.icon}
          onClick={handleLogout}
        />
      </div>

      {/* Notes content */}
      <h1>Notes</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form
        className={styles.noteForm}
        onSubmit={editMode ? updateNote : createNote}
      >
        <input
          type="text"
          className={styles.inputField}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          className={styles.inputField}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          required
        />
        <button type="submit">{editMode ? "Update Note" : "Add Note"}</button>
      </form>

      <ul className={styles.notesList}>
        {notes.map((note) => (
          <li key={note.id} className={styles.noteItem}>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
            <button
              className={styles.editButton}
              onClick={() => editNote(note)}
            >
              Edit
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => deleteNote(note.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notes;
