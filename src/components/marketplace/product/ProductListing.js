import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Star, Play, DollarSign } from 'lucide-react';
import api from '../../../utils/api';
import styles from './ProductListing.module.css';

const ProductListing = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: '', search: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, [filter]);

    const fetchProducts = async () => {
        try {
            const response = await api.marketplace.listProducts(filter);
            setProducts(response.items);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = (productId) => {
        navigate(`/marketplace/products/${productId}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.filterContainer}>
                <input
                    type="text"
                    placeholder="Search products..."
                    className={styles.searchInput}
                    onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                />
                <select
                    className={styles.categorySelect}
                    onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
                >
                    <option value="">All Categories</option>
                    <option value="automation">Automation</option>
                    <option value="programming">Programming</option>
                    <option value="marketing">Marketing</option>
                    <option value="data_analysis">Data Analysis</option>
                    <option value="content_creation">Content Creation</option>
                </select>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className={styles.productGrid}>
                    {products.map((product) => (
                        <div key={product.id} className={styles.productCard}>
                            <div className={styles.productContent}>
                                <div className={styles.productHeader}>
                                    <h3 className={styles.productTitle}>{product.name}</h3>
                                    <div className={styles.rating}>
                                        <Star className={styles.ratingIcon} />
                                        <span>{product.rating?.toFixed(1) || 'New'}</span>
                                    </div>
                                </div>

                                <p className={styles.productDescription}>{product.description}</p>

                                <div className={styles.category}>
                                    <Tag />
                                    <span>{product.category}</span>
                                </div>

                                {product.profile_visible && product.developer && (
                                    <div className={styles.developerInfo}>
                                        <img
                                            src={product.developer.avatar_url || '/placeholder-avatar.png'}
                                            alt="Developer"
                                            className={styles.avatar}
                                        />
                                        <span>{product.developer.display_name}</span>
                                    </div>
                                )}

                                {product.related_videos?.length > 0 && (
                                    <div className={styles.videoCount}>
                                        <Play />
                                        <span>{product.related_videos.length} videos</span>
                                    </div>
                                )}

                                <div className={styles.productFooter}>
                                    <div className={styles.price}>
                                        <DollarSign />
                                        <span className={styles.priceAmount}>${product.price}</span>
                                        <span className={styles.fee}>+5% fee</span>
                                    </div>
                                    <button
                                        onClick={() => handlePurchase(product.id)}
                                        className={styles.viewButton}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductListing;