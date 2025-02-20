import axios from 'axios';
import { ArrowLeft, FileEdit, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CommandDisplay from '../shared/CommandDisplay';
import Header from '../shared/Header';
import CreateRequestModal from './CreateRequestModal';
import styles from './Request.module.css';
import RequestGroupingToolbar from './RequestGroupingToolbar';
import RequestSharing from './RequestSharing';

/**
 * Request Management Component
 * Handles the creation, listing, updating, and deletion of requests
 * Also manages request sharing and project grouping functionality
 */
const Request = () => {
  const { token } = useSelector((state) => state.auth);
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  // State Management
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState([]);

  // Fetch Requests and Projects
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/requests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to fetch requests');
      toast.error('Failed to fetch requests');
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
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to fetch projects');
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchRequests();
    fetchProjects();
  }, [fetchRequests, fetchProjects]);

  // Request CRUD Operations
  const handleCreateRequest = useCallback(
    async (formData) => {

      try {
        const response = await axios.post(`${apiUrl}/requests/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        await fetchRequests();
        setShowCreateModal(false);
        toast.success('Request created successfully');
        return response.data;
      } catch (error) {
        console.error('Error creating request:', error);
        toast.error(error.response?.data?.detail || 'Failed to create request');
        throw error;
      }
    },
    [apiUrl, token, fetchRequests]
  );

  const handleEditRequest = useCallback(
    async (formData) => {

      if (!editingRequest?.id) {
        throw new Error('No request ID for editing');
      }
      try {
        const response = await axios.put(
          `${apiUrl}/requests/${editingRequest.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        await fetchRequests();
        setShowCreateModal(false);
        setEditingRequest(null);
        toast.success('Request updated successfully');
        return response.data;
      } catch (error) {
        console.error('Error updating request:', error);
        toast.error(error.response?.data?.detail || 'Failed to update request');
        throw error;
      }
    },
    [apiUrl, token, editingRequest, fetchRequests]
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?'))
      return;

    try {
      await axios.delete(`${apiUrl}/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests();
      toast.success('Request deleted successfully');
    } catch (error) {
      console.error('Error deleting request:', error);
      setError('Failed to delete request');
      toast.error('Failed to delete request');
    }
  };

  const handleRequestSelect = (requestId) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  // Project Grouping Operations
  const handleGroupRequests = async (projectId) => {
    try {
      await Promise.all(
        selectedRequests.map((requestId) =>
          axios.post(
            `${apiUrl}/requests/${requestId}/project`,
            { project_id: projectId },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        )
      );
      fetchRequests();
      setSelectedRequests([]);
      toast.success('Requests grouped successfully');
    } catch (error) {
      console.error('Error grouping requests:', error);
      setError('Failed to group requests');
      toast.error('Failed to group requests');
    }
  };

  const handleCreateAndGroupProject = async (projectName) => {
    try {
      const response = await axios.post(
        `${apiUrl}/projects/`,
        { name: projectName, description: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await handleGroupRequests(response.data.id);
      fetchProjects();
      toast.success('Project created and requests grouped successfully');
      return true;
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project and group requests');
      toast.error('Failed to create project and group requests');
      return false;
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingRequest(null);
  };

  const handleModalSubmit = useCallback(
    async (formData) => {


      if (editingRequest) {
        try {
          await handleEditRequest(formData);
        } catch (error) {
          console.error('Error in handleEditRequest:', error);
          throw error;
        }
      } else {
        try {
          await handleCreateRequest(formData);
        } catch (error) {
          console.error('Error in handleCreateRequest:', error);
          throw error;
        }
      }
    },
    [editingRequest, handleEditRequest, handleCreateRequest]
  );



  if (isLoading && !requests.length) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loadingContainer}>Loading requests...</div>
      </div>
    );
  }



  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        {selectedRequests.length > 0 && (
          <RequestGroupingToolbar
            selectedRequests={selectedRequests}
            projects={projects}
            onGroup={handleGroupRequests}
            onCreateProject={handleCreateAndGroupProject}
            onClearSelection={() => setSelectedRequests([])}
          />
        )}

        <button
          className={styles.backButton}
          onClick={() => navigate('/client-dashboard')}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div className={styles.requestsHeader}>
          <h2>Your Requests</h2>
          <button
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            Create New Request
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.requestsList}>
          {requests.length === 0 ? (
            <div className={styles.emptyState}>
              No requests yet. Create your first request to get started!
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className={styles.requestCard}>
                <div className={styles.requestHeader}>
                  <div className={styles.selectContainer}>
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => handleRequestSelect(request.id)}
                      className={styles.checkbox}
                    />
                    <h3 className={styles.requestTitle}>{request.title}</h3>
                    {request.project_id && (
                      <span className={styles.projectTag}>
                        Project:{' '}
                        {
                          projects.find((p) => p.id === request.project_id)
                            ?.name
                        }
                      </span>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <button
                      onClick={() => {
                        setEditingRequest(request);
                        setShowCreateModal(true);
                      }}
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
                  isOwner={true} // This is your requests page, so you're always the owner
                  toggleRequestPrivacy={(id, isPublic) => {
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
                        toast.success(
                          `Request is now ${!isPublic ? 'public' : 'private'}`
                        );
                      } catch (error) {
                        console.error('Error toggling privacy:', error);
                        toast.error('Failed to update request privacy');
                      }
                    };
                    togglePrivacy();
                  }
                  }
                />
              </div>
            ))
          )}
        </div>

        {showCreateModal && (
          <CreateRequestModal
            onClose={handleModalClose}
            onSubmit={handleModalSubmit}
            initialData={editingRequest}
            isEditing={!!editingRequest}
          />
        )}
      </div>
    </div>
  );
};

Request.propTypes = {
  // Component doesn't currently take any props but leaving this for future expansion
};

export default Request;
