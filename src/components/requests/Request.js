import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../redux/authSlice";
import RequestSharing from "./RequestSharing";
import CommandDisplay from "../shared/CommandDisplay";
import styles from "./Request.module.css";
import Header from "../shared/Header";
import ConversationNotifications from "../conversations/ConversationNotification";

// Import images
import edit from "../../images/Notes.png";
import del from "../../images/Delete.png";

const apiUrl = process.env.REACT_APP_API_URL;

const Request = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [sharedRequests, setSharedRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectId, setProjectId] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editRequestId, setEditRequestId] = useState(null);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchRequests = useCallback(
    async (projectId = null) => {
      setIsLoading(true);
      try {
        const params = projectId ? { project_id: projectId } : undefined;
        const response = await axios.get(`${apiUrl}/requests/`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [token, handleError]
  );

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
    const fetchSharedRequests = async () => {
      if (token) {
        try {
          const response = await axios.get(
            `${apiUrl}/requests/shared-with-me`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSharedRequests(response.data);
        } catch (error) {
          console.error("Failed to fetch shared requests:", error);
        }
      }
    };
    fetchSharedRequests();
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
      fetchRequests(projectId);
    }
  }, [token, projectId, fetchRequests]);

  const editRequest = (request) => {
    setEditMode(true);
    setEditRequestId(request.id);
    setTitle(request.title);
    setContent(request.content);
    setProjectId(request.project_id);
    setIsPublic(request.is_public);
  };

  const selectProject = (project) => {
    setProjectId(project.id);
    setSelectedProject(project);
  };

  const createRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${apiUrl}/requests/`,
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
      fetchRequests(projectId);
    } catch (error) {
      handleError(error);
    }
  };

  const updateRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${apiUrl}/requests/${editRequestId}`,
        { title, content, project_id: projectId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setEditMode(false);
      setEditRequestId(null);
      setTitle("");
      setContent("");
      fetchRequests(projectId);
    } catch (error) {
      handleError(error);
    }
  };

  const deleteRequest = async (id) => {
    try {
      await axios.delete(`${apiUrl}/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests(projectId);
    } catch (error) {
      handleError(error);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(`${apiUrl}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedProject(null);
      setProjectId(null);
      setRequests([]);
      setError(null);

      const response = await axios.get(`${apiUrl}/projects/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      if (error.response?.status === 400) {
        setError(
          "This project contains requests. Please delete all requests within the project before deleting the project."
        );
      } else {
        handleError(error);
      }
    }
  };

  const toggleRequestPrivacy = async (requestId, currentIsPublic) => {
    try {
      await axios.put(
        `${apiUrl}/requests/${requestId}/privacy`,
        null, // No data in the body
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { is_public: !currentIsPublic }, // Pass is_public as a query parameter
        }
      );
      fetchRequests(projectId); // Refresh the requests list if needed
    } catch (error) {
      console.error("Error toggling request privacy:", error);
    }
  };

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
      <ConversationNotifications apiUrl={apiUrl} />

      <h2 className={styles.sharedRequestsTitle}>Shared Requests</h2>
      <ul className={styles.sharedRequestsList}>
        {sharedRequests
          ?.sort(
            (a, b) =>
              new Date(b.updated_at || b.created_at) -
              new Date(a.updated_at || a.created_at)
          )
          .map((request) => (
            <li key={request.id} className={styles.sharedRequestItem}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setRequests([request]);
                  setSelectedProject(null);
                  setProjectId(null);
                }}
              >
                <span className={styles.requestTitle}>{request.title}</span>
                <div className={styles.sharedByText}>
                  Shared by: {request.owner_username || "Unknown"}
                </div>
              </a>
            </li>
          ))}
      </ul>
    </div>
  );

  const renderRequestsList = () => (
    <ul className={styles.requestsList}>
      {Array.isArray(requests) && requests.length > 0 ? (
        requests.map((request) => (
          <li key={request.id} className={styles.requestItem}>
            <h2>{request.title}</h2>
            <CommandDisplay text={request.content} />
            <div className={styles.requestActions}>
              <img
                src={edit}
                alt="Edit Request"
                className={styles.iconButton}
                onClick={() => editRequest(request)}
              />
              <img
                src={del}
                alt="Delete Request"
                className={styles.iconButton}
                onClick={() => deleteRequest(request.id)}
              />
            </div>
            <RequestSharing
              requestId={request.id}
              token={token}
              apiUrl={apiUrl}
              onShareComplete={() => fetchRequests(projectId)}
              request={request}
              toggleRequestPrivacy={toggleRequestPrivacy}
            />
          </li>
        ))
      ) : (
        <p>
          {selectedProject
            ? "Add a request"
            : projects.length > 0
            ? "Please make your selection from the menu or create a new project."
            : "No requests available yet."}
        </p>
      )}
    </ul>
  );

  return (
    <div className={styles.requestsContainer}>
      <Header />
      <div className={styles.mainContent}>
        {renderSidebar()}
        <div className={styles.requestsContent}>
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
            {/* Place the button here */}
            <button
              className={styles.createProjectButton}
              onClick={() => navigate("/create-project")}
            >
              Create Project
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          <form
            className={styles.requestForm}
            onSubmit={editMode ? updateRequest : createRequest}
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
            <button type="submit" className={styles.addRequestButton}>
              {editMode ? "Update Request" : "Add Request"}
            </button>
          </form>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <p>Loading requests...</p>
            </div>
          ) : (
            renderRequestsList()
          )}
        </div>
      </div>
    </div>
  );
};

export default Request;
