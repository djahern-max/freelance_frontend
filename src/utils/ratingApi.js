import api from './api';
import { API_ROUTES } from './constants';

const ratingApi = {
  async rateDeveloper(developerId, stars) {
    try {
      const response = await api.post(
        API_ROUTES.RATINGS.DEVELOPER(developerId),
        { stars }
      );
      return response.data;
    } catch (error) {
      throw api.helpers.handleError(error);
    }
  },

  async getDeveloperRating(developerId) {
    try {
      const response = await api.get(API_ROUTES.RATINGS.DEVELOPER(developerId));
      return response.data;
    } catch (error) {
      throw api.helpers.handleError(error);
    }
  },

  async getUserRating(developerId) {
    try {
      const response = await api.get(
        API_ROUTES.RATINGS.USER_RATING(developerId)
      );
      return response.data;
    } catch (error) {
      throw api.helpers.handleError(error);
    }
  },
};

export default ratingApi;
