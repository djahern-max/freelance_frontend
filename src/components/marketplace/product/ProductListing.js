import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Star, FileText, } from 'lucide-react';
import api from '../../../utils/api';
import styles from './ProductListing.module.css';

const ProductListing = () => {
    const [products, setProducts] = useState([]);
    const [productFiles, setProductFiles] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: '', search: '' });
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Remove the status filter from the backend request
            const response = await api.get(`${process.env.REACT_APP_API_URL}/marketplace/products`, {
                params: {
                    category: filter.category || undefined,
                    search: filter.search || undefined
                }
            });
            console.log('Products response:', response);
            const productData = response.data?.items || [];
            setProducts(productData);

            // Fetch files for each product
            productData.forEach(product => {
                fetchProductFiles(product.id);
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductFiles = async (productId) => {
        try {
            const response = await api.get(`${process.env.REACT_APP_API_URL}/marketplace/products/${productId}/files/info`);
            setProductFiles(prev => ({
                ...prev,
                [productId]: response.data
            }));
        } catch (error) {
            console.error(`Error fetching files for product ${productId}:`, error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [filter]);

    const getStatusColor = (status) => {
        const colors = {
            DRAFT: 'bg-yellow-100 text-yellow-800',
            PUBLISHED: 'bg-green-100 text-green-800',
            ARCHIVED: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
                                    <h3 className={styles.productTitle}>
                                        {product.name}
                                        <span className={`${styles.statusBadge} ${getStatusColor(product.status)}`}>
                                            {product.status.toLowerCase()}
                                        </span>
                                    </h3>
                                    <div className={styles.rating}>
                                        <Star className={styles.ratingIcon} />
                                        <span>{product.rating?.toFixed(1) || 'New'}</span>
                                    </div>
                                </div>

                                <p className={styles.productDescription}>{product.description}</p>

                                {productFiles[product.id] && productFiles[product.id].length > 0 && (
                                    <div className={styles.fileInfo}>
                                        <div className={styles.fileHeader}>
                                            <FileText className={styles.fileIcon} size={16} />
                                            <span className={styles.downloadStatus}>Purchase Required</span>
                                        </div>
                                        {productFiles[product.id].map((file) => (
                                            <div key={file.id} className={styles.fileDetails}>
                                                <div className={styles.fileMainInfo}>
                                                    <span className={styles.fileName}>{file.file_name}</span>
                                                    <span className={styles.fileVersion}>v{file.version}</span>
                                                </div>
                                                <div className={styles.fileMetaInfo}>
                                                    <span className={styles.fileType}>{file.file_type}</span>
                                                    <span className={styles.fileSize}>
                                                        {formatFileSize(file.file_size)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className={styles.category}>
                                    <Tag size={16} />
                                    <span>{product.category}</span>
                                </div>

                                <div className={styles.productFooter}>
                                    <div className={styles.price}>

                                        <span className={styles.priceAmount}>${product.price}</span>
                                        <span className={styles.fee}>+5% fee</span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/marketplace/products/${product.id}`)}
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