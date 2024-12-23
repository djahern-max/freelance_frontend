// src/components/marketplace/product/ProductList.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/Button';
import styles from './ProductList.module.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/marketplace/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data.items);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className={styles.loading}>Loading products...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (
        <div className={styles.grid}>
            {products.map((product) => (
                <div key={product.id} className={styles.card}>
                    <h3 className={styles.title}>{product.name}</h3>
                    <p className={styles.description}>{product.description}</p>
                    <div className={styles.footer}>
                        <span className={styles.price}>${product.price}</span>
                        <Button
                            onClick={() => navigate(`/marketplace/products/${product.id}`)}
                            label="View Details"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductList;