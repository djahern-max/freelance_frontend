import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../redux/authSlice";
import NoteSharing from "./NoteSharing";
import CommandDisplay from "../shared/CommandDisplay";
import styles from "./Notes.module.css";

// Import images
import newsIcon from "../../images/news.png";
import videos from "../../images/navigate_videos.png";
import appsIcon from "../../images/Apps.png";
import logoutIcon from "../../images/Logout.png";
import edit from "../../images/Notes.png";
import del from "../../images/Delete.png";

const apiUrl = process.env.REACT_APP_API_URL;

const Notes = () => {
  // Redux hooks
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // State declarations
  const [notes, setNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectId, setProjectId] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editNoteId, setEditNoteId] = useState(null);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Callbacks
  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    dispatch(logout());
    navigate("/");
  }, [dispatch, navigate]);

  const handleError = useCallback(
    (error) => {
      if (error.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
        handleLogout();
      } else {
        setError("An error occurred. Please try again.");
      }
    },
    [handleLogout]
  );

  const fetchNotes = useCallback(
    async (projectId = null) => {
      setIsLoading(true);
      try {
        const params = projectId ? { project_id: projectId } : undefined;
        const response = await axios.get(`${apiUrl}/notes/`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setNotes(response.data);
      } catch (error) {
        console.error("Error fetching notes:", error);
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [token, handleError]
  );

  // Effects
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const response = await axios.get(`${apiUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          dispatch(login({ username: response.data.username, token }));
        } catch (error) {
          console.error("Token validation failed", error);
          dispatch(logout());
        }
      }
    };
    validateToken();
  }, [token, dispatch]);

  useEffect(() => {
    const fetchSharedNotes = async () => {
      if (token) {
        try {
          const response = await axios.get(`${apiUrl}/notes/shared-with-me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSharedNotes(response.data);
        } catch (error) {
          console.error("Failed to fetch shared notes:", error);
        }
      }
    };
    fetchSharedNotes();
  }, [token]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (token) {
        try {
          const response = await axios.get(`${apiUrl}/projects/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProjects(response.data);
        } catch (error) {
          console.error("Failed to fetch projects");
        }
      }
    };
    fetchProjects();
  }, [token]);

  useEffect(() => {
    if (token && projectId !== null) {
      fetchNotes(projectId);
    }
  }, [token, projectId, fetchNotes]);

  // Event handlers
  const editNote = (note) => {
    setEditMode(true);
    setEditNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setProjectId(note.project_id);
    setIsPublic(note.is_public);
  };

  const selectProject = (project) => {
    setProjectId(project.id);
    setSelectedProject(project);
  };

  // API handlers
  const createNote = async (e) => {
    e.preventDefault();
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
    try {
      await axios.delete(`${apiUrl}/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes(projectId);
    } catch (error) {
      handleError(error);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(`${apiUrl}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Reset states after successful deletion
      setSelectedProject(null);
      setProjectId(null);
      setNotes([]);
      setError(null); // Clear any existing error messages

      // Refresh projects list
      const response = await axios.get(`${apiUrl}/projects/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      if (error.response?.status === 400) {
        setError(
          "This project contains notes. Please delete all notes within the project before deleting the project."
        );
      } else {
        handleError(error);
      }
    }
  };

  // const toggleNotePrivacy = async (noteId, currentIsPublic) => {
  //   try {
  //     await axios.put(
  //       `${apiUrl}/notes/${noteId}/privacy?is_public=${!currentIsPublic}`,
  //       null,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     fetchNotes(projectId);
  //   } catch (error) {
  //     handleError(error);
  //   }
  // };

  // Render helpers
  const renderIconBar = () => (
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
  );

  const renderSidebar = () => (
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
          <li key={project.id} className={styles.projectItem}>
            <div className={styles.projectRow}>
              <a href="#" onClick={() => selectProject(project)}>
                {project.name}
              </a>
              <span
                className={styles.deleteX}
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      `Are you sure you want to delete ${project.name}?`
                    )
                  ) {
                    deleteProject(project.id);
                  }
                }}
              >
                ×
              </span>
            </div>
          </li>
        ))}
      </ul>

      <h2 className={styles.sharedNotesTitle}>Shared Notes</h2>
      <ul className={styles.sharedNotesList}>
        {sharedNotes
          ?.sort(
            (a, b) =>
              new Date(b.updated_at || b.created_at) -
              new Date(a.updated_at || a.created_at)
          )
          .map((note) => (
            <li key={note.id} className={styles.sharedNoteItem}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setNotes([note]);
                  setSelectedProject(null);
                  setProjectId(null);
                }}
              >
                <span className={styles.noteTitle}>{note.title}</span>
                <div className={styles.sharedByText}>
                  Shared by: {note.owner_username || "Unknown"}
                </div>
              </a>
            </li>
          ))}
      </ul>
    </div>
  );

  const renderNotesList = () => (
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
              // toggleNotePrivacy={toggleNotePrivacy}
              note={note}
            />
          </li>
        ))
      ) : (
        <p>
          {selectedProject
            ? "Add a note"
            : projects.length > 0
            ? "Please make your selection from the menu or create a new project."
            : "No notes available yet."}
        </p>
      )}
    </ul>
  );

  return (
    <div className={styles.notesContainer}>
      {renderIconBar()}
      <div className={styles.mainContent}>
        {renderSidebar()}
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
            renderNotesList()
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
