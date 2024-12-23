// src/utils/marketplaceService.js
import { API_BASE_URL } from './constants';

export const createProduct = async (productData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/marketplace/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create product');
        }

        return response.json();
    } catch (error) {
        throw new Error(error.message || 'Error creating product');
    }
};

export const uploadProductFiles = async (productId, files, fileType) => {
    const formData = new FormData();

    // Add each file to form data
    files.forEach(file => {
        formData.append('files', file);
    });

    // Add file type parameter
    formData.append('file_type', fileType);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/marketplace/products/files/${productId}?file_type=${fileType}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to upload files');
        }

        return await response.json();
    } catch (error) {
        console.error('Error uploading files:', error);
        throw new Error(error.message || 'Failed to upload files');
    }
};

export const getProduct = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to fetch product');
        }

        return response.json();
    } catch (error) {
        throw new Error(error.message || 'Error fetching product');
    }
};