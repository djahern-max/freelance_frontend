// PurchaseSuccessPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyPurchase } from '../../utils/marketplaceService';
import ProductDownload from '../marketplace/product/ProductDownload';
import styles from './DeveloperRatingSection.module.css';


const PurchaseSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [productId, setProductId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyPurchaseAndGetProduct(sessionId);
    }
  }, [searchParams]);

  const verifyPurchaseAndGetProduct = async (sessionId) => {
    try {
      const result = await verifyPurchase(sessionId);
      if (result.success) {
        setProductId(result.product_id);
        setVerificationStatus('success');
      } else {
        setVerificationStatus('failed');
        setError('Purchase verification failed');
      }
    } catch (err) {
      setVerificationStatus('failed');
      setError(err.message);
    }
  };

  if (verificationStatus === 'pending') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          <p>{error || 'Failed to verify purchase'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.successTitle}>Purchase Successful!</h1>
        </div>
        <div className={styles.cardContent}>
          <p className={styles.successMessage}>
            Thank you for your purchase. You can now download your product files below.
          </p>
          {productId && <ProductDownload productId={productId} />}
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;