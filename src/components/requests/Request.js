import axios from 'axios';
import { FileEdit, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CommandDisplay from '../shared/CommandDisplay';
import Header from '../shared/Header';
import styles from './Request.module.css';
import RequestSharing from './RequestSharing';

const Request = () => {
  const { token } = useSelector((state) => state.auth);
  const apiUrl = process.env.REACT_APP_API_URL;

  // State Management
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    project_id: '',
    is_public: false,
    estimated_budget: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editRequestId, setEditRequestId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Requests and Projects
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/requests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched requests:', response.data); // Add this debug log
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error); // Change this to see more details
      setError('Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, token]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/projects/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects');
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchRequests();
    fetchProjects();
  }, [fetchRequests, fetchProjects]);

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const payload = {
      ...formData,
      project_id: formData.project_id || null,
      estimated_budget: formData.estimated_budget
        ? Number(formData.estimated_budget)
        : null,
    };

    try {
      if (editMode) {
        await axios.put(`${apiUrl}/requests/${editRequestId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        await axios.post(`${apiUrl}/requests/`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      setFormData({
        title: '',
        content: '',
        project_id: '',
        is_public: false,
        estimated_budget: '',
      });
      setEditMode(false);
      setEditRequestId(null);
      fetchRequests();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to save request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (request) => {
    setEditMode(true);
    setEditRequestId(request.id);
    setFormData({
      title: request.title,
      content: request.content,
      project_id: request.project_id || '',
      is_public: request.is_public,
      estimated_budget: request.estimated_budget || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?'))
      return;

    try {
      await axios.delete(`${apiUrl}/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests();
    } catch (error) {
      setError('Failed to delete request');
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {editMode ? 'Edit Request' : 'Create New Request'}
          </h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={4}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Project (Optional)</label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="">No Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Estimated Budget ($)</label>
              <input
                type="number"
                name="estimated_budget"
                value={formData.estimated_budget}
                onChange={handleInputChange}
                className={styles.input}
                min="0"
                step="0.01"
              />
            </div>

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                name="is_public"
                id="is_public"
                checked={formData.is_public}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <label htmlFor="is_public" className={styles.label}>
                Make this request public
              </label>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading
                ? 'Saving...'
                : editMode
                ? 'Update Request'
                : 'Create Request'}
            </button>
          </form>
        </div>

        <div className={styles.requestsList}>
          <h2 className={styles.formTitle}>Your Requests</h2>
          {requests.map((request) => (
            <div key={request.id} className={styles.requestCard}>
              <div className={styles.requestHeader}>
                <div>
                  <h3 className={styles.requestTitle}>{request.title}</h3>
                  {request.project_id && (
                    <span className={styles.projectTag}>
                      Project:{' '}
                      {projects.find((p) => p.id === request.project_id)?.name}
                    </span>
                  )}
                </div>
                <div className={styles.actions}>
                  <button
                    onClick={() => handleEdit(request)}
                    className={styles.iconButton}
                  >
                    <FileEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(request.id)}
                    className={styles.deleteButton}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <CommandDisplay text={request.content} />

              <RequestSharing
                requestId={request.id}
                token={token}
                apiUrl={apiUrl}
                onShareComplete={fetchRequests}
                request={request}
                toggleRequestPrivacy={(id, isPublic) => {
                  // Implementation for toggling privacy
                  const togglePrivacy = async () => {
                    try {
                      await axios.put(
                        `${apiUrl}/requests/${id}/privacy`,
                        null,
                        {
                          headers: { Authorization: `Bearer ${token}` },
                          params: { is_public: !isPublic },
                        }
                      );
                      fetchRequests();
                    } catch (error) {
                      console.error('Error toggling privacy:', error);
                    }
                  };
                  togglePrivacy();
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Request;
