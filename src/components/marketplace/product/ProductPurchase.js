import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Star, Tag, PlayCircle, AlertCircle } from 'lucide-react';
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
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const data = await api.marketplace.getProduct(productId);
            setProduct(data);
        } catch (error) {
            setError('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

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
            setError('Failed to initiate purchase. Please try again.');
            setPurchasing(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (error || !product) {
        return (
            <div className={styles.errorContainer}>
                <AlertCircle className={styles.errorIcon} />
                {error || 'Product not found'}
            </div>
        );
    }

    const totalPrice = product.price * 1.05;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.cardContent}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>{product.name}</h1>
                        <div className={styles.rating}>
                            <Star className={styles.ratingIcon} />
                            <span>{product.rating?.toFixed(1) || 'New'}</span>
                        </div>
                    </div>

                    <div className={styles.category}>
                        <Tag />
                        <span>{product.category}</span>
                    </div>

                    <div className={styles.description}>
                        <p className={styles.shortDesc}>{product.description}</p>
                        <div className={styles.longDesc}>{product.long_description}</div>
                    </div>

                    {product.profile_visible && product.developer && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>About the Developer</h2>
                            <div className={styles.developerProfile}>
                                <img
                                    src={product.developer.avatar_url || '/placeholder-avatar.png'}
                                    alt={product.developer.display_name}
                                    className={styles.avatar}
                                />
                                <div className={styles.developerInfo}>
                                    <h3>{product.developer.display_name}</h3>
                                    <p>{product.developer.bio}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {product.related_videos?.length > 0 && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Product Videos</h2>
                            <div className={styles.videoGrid}>
                                {product.related_videos.map((video) => (
                                    <div key={video.id} className={styles.videoCard}>
                                        <div className={styles.videoPreview}>
                                            <PlayCircle className={styles.playIcon} />
                                        </div>
                                        <p className={styles.videoTitle}>{video.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.section}>
                        <div className={styles.priceSection}>
                            <div className={styles.priceInfo}>
                                <p>Price: ${product.price.toFixed(2)}</p>
                                <p className={styles.fee}>
                                    Platform fee (5%): ${(product.price * 0.05).toFixed(2)}
                                </p>
                                <p className={styles.total}>
                                    Total: ${totalPrice.toFixed(2)}
                                </p>
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

                    {error && (
                        <div className={styles.error}>
                            <AlertCircle />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductPurchase;