// src/utils/marketplaceService.js

const API_BASE = '/api/marketplace';

export const createProduct = async (productData) => {
    const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
    });

    if (!response.ok) {
        throw new Error('Failed to create product');
    }

    return response.json();
};

export const uploadProductFiles = async (productId, files, fileType = 'executable') => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    formData.append('file_type', fileType);

    const response = await fetch(`${API_BASE}/products/files/${productId}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload files');
    }

    return response.json();
};

export const purchaseProduct = async (productId) => {
    const response = await fetch(`${API_BASE}/products/${productId}/purchase`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to initiate purchase');
    }

    return response.json();
};

export const getProduct = async (productId) => {
    const response = await fetch(`${API_BASE}/products/${productId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch product');
    }

    return response.json();
};

export const listProducts = async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE}/products?${queryParams}`);

    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }

    return response.json();
};

export const updateProduct = async (productId, updateData) => {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        throw new Error('Failed to update product');
    }

    return response.json();
};

export const getProductReviews = async (productId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE}/products/${productId}/reviews?${queryParams}`);

    if (!response.ok) {
        throw new Error('Failed to fetch reviews');
    }

    return response.json();
};

export const createProductReview = async (productId, reviewData) => {
    const response = await fetch(`${API_BASE}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
        throw new Error('Failed to create review');
    }

    return response.json();
};

export const getDeveloperProducts = async (developerId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE}/developers/${developerId}/products?${queryParams}`);

    if (!response.ok) {
        throw new Error('Failed to fetch developer products');
    }

    return response.json();
};