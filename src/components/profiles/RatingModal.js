import { Star, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const RatingModal = ({ developerId, onClose, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.ratings.rateDeveloper(developerId, {
        stars: rating,
        comment,
      });

      toast.success('Rating submitted successfully');
      if (onRatingSubmitted) {
        onRatingSubmitted(response);
      }
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="overlay"
      onClick={(e) => e.target.className === 'overlay' && onClose()}
    >
      <div className="modal">
        <div className="header">
          <h2 className="title">Rate Creator</h2>
          <button onClick={onClose} className="closeButton">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="formGroup">
            <label className="label">Rating</label>
            <div className="starContainer">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="starButton"
                >
                  <Star
                    className={`star ${value <= rating ? 'starActive' : ''}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="formGroup">
            <label className="label">Comments (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="textarea"
              rows="4"
              placeholder="Share your thoughts about this creator..."
            />
          </div>

          <div className="buttonContainer">
            <button
              type="submit"
              className="submitButton"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
