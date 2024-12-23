// src/components/marketplace/product/ProductDetail.js
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Alert from '../../shared/Alert';
import Button from '../../shared/Button';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/marketplace/products/${productId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product details');
                }
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const handlePurchase = async () => {
        try {
            const response = await fetch(`/api/marketplace/products/${productId}/purchase`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Purchase failed');
            }

            const { url } = await response.json();
            window.location.href = url; // Redirect to Stripe checkout
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <Alert message={error} type="error" />;
    if (!product) return <Alert message="Product not found" type="error" />;

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>{product.name}</h1>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Description</h2>
                    <p className={styles.description}>{product.description}</p>
                    {product.long_description && (
                        <div className={styles.longDescription}>
                            <h3 className={styles.subsectionTitle}>Detailed Description</h3>
                            <p>{product.long_description}</p>
                        </div>
                    )}
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Details</h2>
                    <div className={styles.detailsGrid}>
                        <div>
                            <p>Price: ${product.price}</p>
                            <p>Category: {product.category}</p>
                            <p>Version: {product.version}</p>
                        </div>
                        <div>
                            <p>Downloads: {product.download_count}</p>
                            <p>Rating: {product.rating ? `${product.rating}/5` : 'No ratings yet'}</p>
                        </div>
                    </div>
                </div>

                {product.requirements && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>System Requirements</h2>
                        <p>{product.requirements}</p>
                    </div>
                )}

                {product.installation_guide && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Installation Guide</h2>
                        <p>{product.installation_guide}</p>
                    </div>
                )}

                <div className={styles.purchaseSection}>
                    <div className={styles.price}>${product.price}</div>
                    <Button
                        onClick={handlePurchase}
                        label="Purchase Now"
                        className={styles.purchaseButton}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;