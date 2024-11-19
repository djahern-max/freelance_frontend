// src/components/conversations/WorkAgreement.js
import axios from 'axios';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectToken } from '../../redux/authSlice';
import styles from './WorkAgreement.module.css';

const WorkAgreement = ({
  requestId,
  developerId,
  clientId,
  onAgreementCreated,
}) => {
  const [price, setPrice] = useState('');
  const [terms, setTerms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = useSelector(selectToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        '/api/agreements/',
        {
          request_id: requestId,
          price: Number(price),
          terms,
          developer_id: developerId,
          client_id: clientId,
          status: 'proposed',
          proposed_by: developerId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onAgreementCreated(response.data);
      setPrice('');
      setTerms('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create agreement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Create Work Agreement</h3>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Price (USD)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Terms and Conditions</label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className={styles.textarea}
            placeholder="Describe the work terms, timeline, and payment schedule..."
            required
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
        >
          {loading ? 'Creating Agreement...' : 'Propose Agreement'}
        </button>
      </form>
    </div>
  );
};

export default WorkAgreement;
