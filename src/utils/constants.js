export const API_BASE_URL = process.env.REACT_APP_API_URL;

export const API_ROUTES = {
  PAYMENTS: {
    CREATE_SUBSCRIPTION: '/payments/create-subscription',
    SUBSCRIPTION_STATUS: '/payments/subscription-status',
    WEBHOOK: '/payments/webhook',
  },
  RATINGS: {
    DEVELOPER: (id) => `/ratings/developer/${id}`,
    USER_RATING: (id) => `/ratings/developer/${id}/user-rating`,
  },
};
