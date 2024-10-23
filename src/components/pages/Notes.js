import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Notes.module.css";
import newsIcon from "../../images/news.png";
import videos from "../../images/navigate_videos.png";
import appsIcon from "../../images/Apps.png";
import logoutIcon from "../../images/Logout.png";
import edit from "../../images/Notes.png";
import del from "../../images/Delete.png";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../redux/authSlice";

const API_URL = process.env.REACT_APP_API_URL;

const Notes = () => {
  const dispatch = useDispatch(); // Add this line to initialize dispatch
  const { token, user } = useSelector((state) => state.auth); // Access Redux state
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editNoteId, setEditNoteId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check token on load
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          dispatch(login({ username: response.data.username, token })); // Dispatch Redux login
        } catch (error) {
          console.error("Token validation failed", error);
          dispatch(logout()); // Dispatch Redux logout
        }
      }
    };

    validateToken(); // Call the function on mount
  }, [token, dispatch]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    if (token) fetchProjects();
  }, [token]);

  const fetchNotes = async (projectId = null) => {
    try {
      const response = await axios.get(`${API_URL}/notes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          project_id: projectId,
        },
      });
      setNotes(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    if (token && projectId) fetchNotes(projectId);
  }, [token, projectId]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch(logout()); // Use Redux logout
    navigate("/login");
  };
  const createNote = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/notes/`,
        { title, content, project_id: projectId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTitle("");
      setContent("");
      fetchNotes(projectId);
    } catch (error) {
      handleError(error);
    }
  };

  const editNote = (note) => {
    setEditMode(true);
    setEditNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setProjectId(note.project_id);
  };

  const updateNote = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/notes/${editNoteId}`,
        { title, content, project_id: projectId },
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
      fetchNotes(projectId);
    } catch (error) {
      handleError(error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/notes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchNotes(projectId);
    } catch (error) {
      handleError(error);
    }
  };

  const selectProject = (project) => {
    setProjectId(project.id);
    setSelectedProject(project);
  };

  const handleError = (error) => {
    if (error.response && error.response.status === 401) {
      setError("Unauthorized. Please log in again.");
      handleLogout();
    } else {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.notesContainer}>
      <div className={styles["icon-bar"]}>
        <img
          src={newsIcon}
          alt="News"
          title="Go to News"
          className={styles.icon}
          onClick={() => navigate("/newsletter-dashboard")}
        />
        <img
          src={videos}
          alt="Videos"
          title="Go to Videos"
          className={styles.icon}
          onClick={() => navigate("/videos")}
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

      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <button
            className={styles.createProjectButton}
            onClick={() => navigate("/create-project")}
          >
            Create Project
          </button>
          <h2>Projects</h2>
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                <a href="#" onClick={() => selectProject(project)}>
                  {project.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.notesContent}>
          {selectedProject && <h2>{selectedProject.name}</h2>}

          <div className={styles.dropdown}>
            <select
              className={styles.selectField}
              value={projectId || ""}
              onChange={(e) =>
                selectProject(
                  projects.find((p) => p.id === parseInt(e.target.value))
                )
              }
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <button
              className={styles.createProjectButton}
              onClick={() => navigate("/create-project")}
            >
              Create Project
            </button>
          </div>

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
              className={`${styles.inputField} ${styles.commandDisplay}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              required
            />
            <button type="submit" className={styles.addNoteButton}>
              {editMode ? "Update Note" : "Add Note"}
            </button>
          </form>

          <ul className={styles.notesList}>
            {Array.isArray(notes) && notes.length > 0 ? (
              notes.map((note) => (
                <li key={note.id} className={styles.noteItem}>
                  <h2>{note.title}</h2>
                  <pre className={styles.codeBlock}>{note.content}</pre>
                  <img
                    src={edit}
                    alt="Edit Note"
                    className={styles.iconButton}
                    onClick={() => editNote(note)}
                  />
                  <img
                    src={del}
                    alt="Delete Note"
                    className={styles.iconButton}
                    onClick={() => deleteNote(note.id)}
                  />
                </li>
              ))
            ) : (
              <p>No notes available yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Notes;
