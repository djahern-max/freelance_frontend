// src/utils/formValidation.js
const formValidation = {
    username: {
        validate: (value) => {
            if (!value.trim()) return 'Username is required';
            if (value.length < 3) return 'Username must be at least 3 characters';
            if (value.length > 20) return 'Username must be less than 20 characters';
            // Allow letters, numbers, underscores, hyphens, but no spaces
            if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                return 'Username can only contain letters, numbers, underscores and hyphens (no spaces)';
            }
            return null;
        }
    },
    email: {
        validate: (value) => {
            if (!value.trim()) return 'Email is required';
            if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
            return null;
        }
    },
    password: {
        validate: (value) => {
            if (!value) return 'Password is required';
            if (value.length < 8) return 'Password must be at least 8 characters';
            // Optional: Add more password requirements (uppercase, lowercase, numbers, special chars)
            return null;
        }
    },
    confirmPassword: {
        validate: (value, { password }) => {
            if (!value) return 'Please confirm your password';
            if (value !== password) return 'Passwords do not match';
            return null;
        }
    },
    fullName: {
        validate: (value) => {
            if (!value.trim()) return 'Full name is required';
            return null;
        }
    },
    termsAccepted: {
        validate: (value) => {
            if (!value) return 'You must accept the Terms and Conditions';
            return null;
        }
    }
};

export default formValidation;