import {
  AlertCircle,
  ArrowLeft,
  Clock,
  DollarSign,
  FileText,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './ProjectAgreementView.module.css';

const ProjectAgreementView = () => {
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [developer, setDeveloper] = useState(null);
  const [client, setClient] = useState(null);

  // Extract request ID from URL
  const requestId = window.location.pathname.split('/').pop();

  useEffect(() => {
    const fetchAgreementData = async () => {
      try {
        setLoading(true);
        // Fetch agreement details
        const agreementResponse = await api.get(
          `/agreements/request/${requestId}`
        );
        setAgreement(agreementResponse.data);

        // Fetch request details
        const requestResponse = await api.get(`/requests/${requestId}`);
        setRequest(requestResponse.data);

        // TODO: Implement user profile fetching once backend endpoints are ready
        // setDeveloper(developerResponse.data);
        // setClient(clientResponse.data);
      } catch (err) {
        console.error('Error fetching agreement data:', err);
        setError(
          err.response?.data?.detail || 'Failed to load agreement details'
        );
        toast.error('Failed to load agreement details');
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchAgreementData();
    }
  }, [requestId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          Loading agreement details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <AlertCircle className={styles.errorIcon} />
          <div className={styles.errorMessage}>{error}</div>
          <button
            onClick={() => navigate(-1)}
            className={styles.buttonSecondary}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <ArrowLeft />
          </button>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{request?.title}</h1>
            <p className={styles.subtitle}>Agreement Details</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <div className={styles.mainGrid}>
          {/* Agreement Details */}
          <div className={styles.mainSection}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Agreement Information</h2>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <DollarSign className={styles.icon} />
                  <span className={styles.label}>Price:</span>
                  <span>{formatCurrency(agreement?.price || 0)}</span>
                </div>
                <div className={styles.infoItem}>
                  <Clock className={styles.icon} />
                  <span className={styles.label}>Status:</span>
                  <span className={styles.capitalize}>{agreement?.status}</span>
                </div>
                <div className={styles.termsSection}>
                  <div className={styles.label}>Terms and Conditions:</div>
                  <div className={styles.terms}>{agreement?.terms}</div>
                </div>
              </div>

              {/* Negotiation History */}
              <div className={styles.historySection}>
                <h3 className={styles.subsectionTitle}>Negotiation History</h3>
                <div className={styles.historyList}>
                  {agreement?.negotiation_history?.map((entry, index) => (
                    <div key={index} className={styles.historyItem}>
                      <div className={styles.historyHeader}>
                        <span className={styles.capitalize}>
                          {entry.action}
                        </span>
                        <span className={styles.timestamp}>
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                      <div className={styles.historyDetails}>
                        Price: {formatCurrency(entry.price)}
                      </div>
                      {entry.changes && (
                        <div className={styles.historyChanges}>
                          Changes: {entry.changes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Placeholder for future interactive features */}
              {/* TODO: Add these features when backend is ready */}
              {/* <div className={styles.actionsSection}>
                <h3 className={styles.subsectionTitle}>Actions</h3>
                <div className={styles.actionButtons}>
                  <button className={styles.buttonPrimary}>
                    Propose Changes
                  </button>
                  <button className={styles.buttonSuccess}>
                    Accept Agreement
                  </button>
                </div>
              </div> */}
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            {/* Request Details */}
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Request Details</h2>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <FileText className={styles.icon} />
                  <div>
                    <span className={styles.label}>Description:</span>
                    <p className={styles.description}>{request?.content}</p>
                  </div>
                </div>
                {request?.estimated_budget && (
                  <div className={styles.infoItem}>
                    <DollarSign className={styles.icon} />
                    <div>
                      <span className={styles.label}>Estimated Budget:</span>
                      <p>{formatCurrency(request.estimated_budget)}</p>
                    </div>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <Clock className={styles.icon} />
                  <div>
                    <span className={styles.label}>Created:</span>
                    <p>{formatDate(request?.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Participants</h2>
              <div className={styles.participantsList}>
                <div className={styles.participant}>
                  <Users className={styles.icon} />
                  <div>
                    <p className={styles.label}>Client</p>
                    <p className={styles.participantName}>
                      {client?.username || request?.owner_username}
                    </p>
                  </div>
                </div>
                <div className={styles.participant}>
                  <Users className={styles.icon} />
                  <div>
                    <p className={styles.label}>Developer</p>
                    <p className={styles.participantName}>
                      {developer?.username || 'Loading...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAgreementView;
