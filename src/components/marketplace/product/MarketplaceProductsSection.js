// src/components/marketplace/product/MarketplaceProductsSection.js
import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import styles from './MarketplaceProductsSection.module.css';
import api from '../../../utils/api';
import ProductDownload from './ProductDownload';

const MarketplaceProductsSection = () => {
    const [purchasedProducts, setPurchasedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('MarketplaceProductsSection mounted');
        fetchPurchasedProducts();
    }, []);

    const fetchPurchasedProducts = async () => {
        console.log('Fetching purchased products...');
        try {
            // First get all products
            const response = await api.get('/marketplace/products');
            console.log('Products response:', response.data);

            // Then check which ones are purchased
            const products = response.data.items;
            console.log('Products:', products);

            // For debugging, let's show all products for now
            setPurchasedProducts(products);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load your purchased products');
        } finally {
            setLoading(false);
        }
    };

    console.log('Rendering with state:', { loading, error, purchasedProducts });

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading products...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <span className={styles.errorIcon}>⚠️</span>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <Package className={styles.icon} />
                <h2>My Marketplace Products</h2>
            </div>

            {purchasedProducts.length > 0 ? (
                <div className={styles.productsGrid}>
                    {purchasedProducts.map((product) => (
                        <div key={product.id} className={styles.productCard}>
                            <h3 className={styles.productTitle}>{product.name}</h3>
                            <p className={styles.productDescription}>{product.description}</p>
                            <div className={styles.productMeta}>
                                <span className={styles.price}>${product.price}</span>
                                <span className={styles.category}>{product.category}</span>
                            </div>
                            <ProductDownload productId={product.id} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <Package className={styles.emptyIcon} />
                    <p>No products available</p>
                    <button
                        onClick={() => window.location.href = '/marketplace'}
                        className={styles.browseButton}
                    >
                        Browse Marketplace
                    </button>
                </div>
            )}
        </div>
    );
};

export default MarketplaceProductsSection;