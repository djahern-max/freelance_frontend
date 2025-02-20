import { XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './RequestSharing.module.css';


const RequestSharing = ({
  requestId,
  token,
  apiUrl,
  onShareComplete,
  request,

}) => {
  const [shareUsername, setShareUsername] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [isPrivacyUpdating, setIsPrivacyUpdating] = useState(false);

  useEffect(() => {


    const sharedWithData = request?.shared_with || request?.shared_with_info;

    if (sharedWithData) {
      setSharedUsers(
        sharedWithData.map((share) => ({
          id: share.user_id,
          username: share.username,
          can_edit: share.can_edit,
        }))
      );
    } else {
      setSharedUsers([]);
    }
  }, [request]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchTerm = query.startsWith('@') ? query.slice(1) : query;

    try {
      const response = await fetch(
        `${apiUrl}/requests/users/search?q=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const users = await response.json();
        setSuggestions(users || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handlePrivacyToggle = async () => {
    setIsPrivacyUpdating(true);
    setError('');
    try {
      const response = await fetch(
        `${apiUrl}/requests/${requestId}/privacy?is_public=${!request.is_public}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }
      if (onShareComplete) {
        onShareComplete();
      }
    } catch (error) {
      console.error('Failed to update privacy:', error);
      setError('Unable to update privacy settings');
    } finally {
      setIsPrivacyUpdating(false);
    }
  };


  const handleInputChange = (e) => {
    const value = e.target.value;
    setShareUsername(value);

    // Start searching as soon as user types
    if (value.trim()) {
      searchUsers(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (username) => {
    setShareUsername(username);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleShare = async () => {
    if (!shareUsername.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const username = shareUsername.replace('@', '');

      const userSearchResponse = await fetch(
        `${apiUrl}/requests/users/search?q=${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!userSearchResponse.ok) {
        throw new Error('User not found');
      }

      const users = await userSearchResponse.json();
      const userToShare = users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase()
      );

      if (!userToShare) {
        throw new Error('User not found');
      }

      // Check if already shared
      if (sharedUsers.some((user) => user.username === userToShare.username)) {
        setError('Request is already shared with this user');
        return;
      }

      const response = await fetch(`${apiUrl}/requests/${requestId}/share`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shared_with_user_id: userToShare.id,
          can_edit: true,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.detail || 'Failed to share request');
      }

      setSharedUsers((prev) => [
        ...prev,
        {
          id: userToShare.id,
          username: userToShare.username,
          can_edit: true,
        },
      ]);

      setShareUsername('');
      if (onShareComplete) onShareComplete();
    } catch (error) {
      setError(error.message || 'Failed to share request');
    } finally {
      setIsLoading(false);
    }
  };

  const removeShare = async (userId) => {
    try {
      const response = await fetch(
        `${apiUrl}/requests/${requestId}/share/${userId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setSharedUsers((prev) => prev.filter((user) => user.id !== userId));
        if (onShareComplete) onShareComplete();
      }
    } catch (error) {
      console.error('Error removing share:', error);
      setError('Failed to remove share');
    }
  };

  return (
    <div className={styles.sharingSection}>
      <div className={styles.shareControls}>
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            className={styles.shareInput}
            value={shareUsername}
            onChange={handleInputChange}
            placeholder="@..."
          />

          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className={styles.suggestionsDropdown}>
              {suggestions.map((user) => (
                <div
                  key={user.id}
                  className={styles.suggestion}
                  onClick={() => handleSuggestionClick(user.username)}
                >
                  @{user.username}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className={styles.shareButton}
          onClick={handleShare}
          disabled={isLoading}
        >
          {isLoading ? 'Sharing...' : 'Share'}
        </button>

        <div className={styles.toggleGroup}>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={request.is_public}
              onChange={handlePrivacyToggle}
              disabled={isPrivacyUpdating}
            />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>
            {isPrivacyUpdating ? 'Updating...' : request.is_public ? 'Public' : 'Private'}
          </span>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* Add this section to display shared users */}
        {(sharedUsers?.length > 0 || request?.shared_with?.length > 0) && (
          <div className={styles.sharedWithList}>
            <div className={styles.sharedWithTitle}>Shared with:</div>
            <div className={styles.sharedUsersList}>
              {(sharedUsers.length > 0 ? sharedUsers : request.shared_with).map(
                (share) => (
                  <div
                    key={share.user_id || share.id}
                    className={styles.sharedUser}
                  >
                    <span className={styles.username}>@{share.username}</span>
                    <button
                      className={styles.removeUserButton}
                      onClick={() => removeShare(share.user_id || share.id)}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestSharing;
