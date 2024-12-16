// src/utils/ratingService.js
import api from './api';

const ratingService = {
  rateDeveloper: api.ratings.rateDeveloper,
  getDeveloperRating: api.ratings.getDeveloperRating,
  getUserRating: api.ratings.getUserRating,
};

export default ratingService;
