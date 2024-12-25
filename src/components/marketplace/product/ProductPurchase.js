// components/marketplace/product/ProductPurchase.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Tag } from 'lucide-react';
import api from '../../../utils/api';
import { selectIsAuthenticated } from '../../../redux/authSlice';
import styles from './ProductPurchase.module.css';

const ProductPurchase = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await api.marketplace.getProduct(productId);
                console.log('Product data:', data); // Debug log
                setProduct(data);
            } catch (error) {
                console.error('Error fetching product:', error);
                setError('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { redirect: `/marketplace/products/${productId}` } });
            return;
        }

        setPurchasing(true);
        setError('');

        try {
            const response = await api.marketplace.purchaseProduct(productId);
            window.location.href = response.url;
        } catch (error) {
            console.error('Purchase error:', error);
            setError('Failed to initiate purchase. Please try again.');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                {error}
            </div>
        );
    }

    if (!product) {
        return <div className={styles.errorContainer}>Product not found</div>;
    }

    const platformFee = product.price * 0.05;
    const total = product.price + platformFee;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.cardContent}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>{product.name}</h1>
                        <span className={styles.badge}>New</span>
                    </div>

                    <div className={styles.category}>
                        <Tag className={styles.categoryIcon} />
                        <span>{product.category}</span>
                    </div>

                    <div className={styles.description}>
                        <p>{product.description}</p>
                        {product.long_description && (
                            <p className={styles.longDesc}>{product.long_description}</p>
                        )}
                    </div>

                    <div className={styles.priceSection}>
                        <div className={styles.priceInfo}>
                            <div className={styles.priceRow}>
                                <span>Price:</span>
                                <span>${product.price.toFixed(2)}</span>
                            </div>
                            <div className={styles.feeRow}>
                                <span>Platform fee (5%):</span>
                                <span>${platformFee.toFixed(2)}</span>
                            </div>
                            <div className={styles.totalRow}>
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePurchase}
                            disabled={purchasing}
                            className={styles.purchaseButton}
                        >
                            {purchasing ? 'Processing...' : 'Purchase Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPurchase;