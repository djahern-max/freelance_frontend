import { API_BASE_URL } from './constants';

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API request failed');
    }
    return response.json();
};

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const createProduct = async (productData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/marketplace/products`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error creating product');
    }
};

export const uploadProductFiles = async (productId, files, fileType) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    formData.append('file_type', fileType);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/marketplace/products/files/${productId}?file_type=${fileType}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error uploading files:', error);
        throw new Error(error.message || 'Failed to upload files');
    }
};

export const getProduct = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error fetching product');
    }
};

export const listProducts = async (filter) => {
    const params = new URLSearchParams(filter);
    try {
        const response = await fetch(`${API_BASE_URL}/marketplace/products?${params}`);
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error listing products');
    }
};

export const purchaseProduct = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}/purchase`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error processing purchase');
    }
};

export const getProductDownloadUrl = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/marketplace/products/files/${productId}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.detail || 'Failed to get download URL');
        return data;
    } catch (error) {
        throw new Error(error.message || 'Error getting download URL');
    }
};

export const verifyPurchase = async (sessionId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/marketplace/purchase/verify/${sessionId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error verifying purchase');
    }
};

export const getProductFiles = async (productId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}/files/info`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    } catch (error) {
        throw new Error(error.message || 'Error getting file information');
    }
};

export const downloadProductFile = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Download failed');
        return response.blob();
    } catch (error) {
        throw new Error(error.message || 'Error downloading file');
    }
};

const marketplaceService = {
    createProduct,
    uploadProductFiles,
    getProduct,
    listProducts,
    purchaseProduct,
    getProductDownloadUrl,
    verifyPurchase,
    getProductFiles,
    downloadProductFile
};

export default marketplaceService;