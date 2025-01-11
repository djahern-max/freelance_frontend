// src/utils/stripeService.js
const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            data
        });
        throw new Error(data.message || 'Request failed');
    }
    return data;
};

export const createPaymentIntent = async (amount) => {
    try {


        const response = await fetch('/api/payments/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any auth headers you might need
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ amount }),
        });

        return handleResponse(response);
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
};

export const getStripeConfig = async () => {
    try {

        const response = await fetch('/api/payments/config');
        return handleResponse(response);
    } catch (error) {
        console.error('Error fetching Stripe config:', error);
        throw error;
    }
};

export const processPayment = async (stripe, elements, clientSecret) => {
    try {


        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement('card'),
            },
        });

        if (error) {
            console.error('Stripe payment error:', error);
            throw new Error(error.message);
        }

        return paymentIntent;
    } catch (error) {
        console.error('Error processing payment:', error);
        throw error;
    }
};