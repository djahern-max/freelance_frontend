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
import NoteSharing from "./NoteSharing";
import CommandDisplay from "../shared/CommandDisplay";

const apiUrl = process.env.REACT_APP_API_URL;

const Notes = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editNoteId, setEditNoteId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState(null);
  const [shareUsername, setShareUsername] = useState(""); // For sharing note
  const [isPublic, setIsPublic] = useState(false); // For toggling privacy
  const navigate = useNavigate();

  const editNote = (note) => {
    setEditMode(true);
    setEditNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setProjectId(note.project_id);
    setIsPublic(note.is_public); // Set current privacy state
  };

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const response = await axios.get(`${apiUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          dispatch(login({ username: response.data.username, token }));
          console.log(
            "Logged in user and token:",
            response.data.username,
            token
          );
        } catch (error) {
          console.error("Token validation failed", error);
          dispatch(logout());
        }
      }
    };

    validateToken();
  }, [token, dispatch]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${apiUrl}/projects/`, {
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

  const [isLoading, setIsLoading] = useState(false);

  const fetchNotes = async (projectId = null) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Token not found");
      }

      const params = new URLSearchParams();
      if (projectId) {
        params.append("project_id", projectId);
      }

      const response = await axios.get(`${apiUrl}/notes/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: projectId ? { project_id: projectId } : undefined,
      });

      setNotes(response.data);
      console.log("Fetched notes:", response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update useEffect to only fetch when there's both token and projectId
  useEffect(() => {
    if (token && projectId !== null) {
      fetchNotes(projectId);
    }
  }, [token, projectId]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    dispatch(logout());
    navigate("/");
  };

  const createNote = async (e) => {
    e.preventDefault();
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    try {
      await axios.post(
        `${apiUrl}/notes/`,
        { title, content, project_id: projectId, is_public: isPublic },
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
      console.error("Error creating note:", error);
      handleError(error);
    }
  };

  const updateNote = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${apiUrl}/notes/${editNoteId}`,
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
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");
    try {
      await axios.delete(`${apiUrl}/notes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchNotes(projectId);
    } catch (error) {
      handleError(error);
    }
  };

  // In Notes.js, modify the toggleNotePrivacy function:
  const toggleNotePrivacy = async (noteId, currentIsPublic) => {
    try {
      await axios.put(
        `${apiUrl}/notes/${noteId}/privacy?is_public=${!currentIsPublic}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh notes to get updated state
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

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <p>Loading notes...</p>
            </div>
          ) : (
            // In Notes.js, update the notes mapping section:
            <ul className={styles.notesList}>
              {Array.isArray(notes) && notes.length > 0 ? (
                notes.map((note) => (
                  <li key={note.id} className={styles.noteItem}>
                    <h2>{note.title}</h2>
                    <CommandDisplay text={note.content} />
                    <div className={styles.noteActions}>
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
                    </div>
                    <NoteSharing
                      noteId={note.id}
                      token={token}
                      apiUrl={apiUrl}
                      onShareComplete={() => fetchNotes(projectId)}
                      toggleNotePrivacy={toggleNotePrivacy}
                      note={note}
                    />
                  </li>
                ))
              ) : (
                <p>No notes available yet.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
