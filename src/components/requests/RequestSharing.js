// RequestSharing.js
import { Globe, Lock, Search, UserPlus, Users, X } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import styles from './RequestSharing.module.css';

const RequestSharing = ({
  requestId,
  token,
  apiUrl,
  onShareComplete,
  request,
  toggleRequestPrivacy,
}) => {
  const [shareUsername, setShareUsername] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (request && request.shared_with) {
      setSharedUsers(
        request.shared_with.map((share) => ({
          id: share.user_id,
          username: share.username,
          can_edit: share.can_edit,
        }))
      );
    } else {
      setSharedUsers([]);
    }
  }, [request]);

  const searchUsers = async (query) => {
    if (!query.startsWith('@')) return;
    const searchTerm = query.slice(1);

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
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setShareUsername(value);
    setError('');

    if (value.includes('@')) {
      searchUsers(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (username) => {
    setShareUsername(`@${username}`);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleShare = async () => {
    setIsLoading(true);
    setError('');

    try {
      const username = shareUsername.startsWith('@')
        ? shareUsername.slice(1)
        : shareUsername;

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
      const userToShare = users.find((u) => u.username === username);

      if (!userToShare) {
        throw new Error('User not found');
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

      const responseData = await response.json();
      console.log('Share response:', response.status, responseData);

      if (!response.ok) {
        if (
          response.status === 400 &&
          responseData.detail?.includes('already shared')
        ) {
          setError('Request is already shared with this user');
        } else {
          throw new Error(responseData.detail || 'Failed to share request');
        }
        return;
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
      setSuggestions([]);
      setShowSuggestions(false);
      if (onShareComplete) onShareComplete();
    } catch (error) {
      console.error('Share error:', error);
      setError(
        error.message ||
          'Failed to share request. Please check the username and try again.'
      );
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
      } else {
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Error removing share:', error);
    }
  };

  return (
    <div className={styles.shareContainer}>
      <div className={styles.shareHeader}>
        <div className={styles.shareTitle}>
          <Users size={16} className={styles.titleIcon} />
          <span>Share Request</span>
        </div>
        <button
          className={styles.privacyToggle}
          onClick={() => toggleRequestPrivacy(request.id, request.is_public)}
        >
          {request.is_public ? (
            <>
              <Globe size={16} />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>Private</span>
            </>
          )}
        </button>
      </div>

      <div className={styles.shareControls}>
        <div className={styles.inputWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.shareInput}
            value={shareUsername}
            onChange={handleInputChange}
            placeholder="Type @ to search users..."
          />
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className={styles.suggestionsDropdown}>
              {suggestions.map((user) => (
                <div
                  key={user.id}
                  className={styles.suggestionItem}
                  onClick={() => handleSuggestionClick(user.username)}
                >
                  <Users size={14} />
                  <span>@{user.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className={styles.shareButton}
          onClick={handleShare}
          disabled={isLoading || !shareUsername.trim()}
        >
          <UserPlus size={16} />
          <span>{isLoading ? 'Sharing...' : 'Share'}</span>
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <X size={14} />
          <span>{error}</span>
        </div>
      )}

      {sharedUsers.length > 0 && (
        <div className={styles.sharedWithSection}>
          <div className={styles.sharedWithTitle}>
            <Users size={14} />
            <span>Shared with</span>
          </div>
          <div className={styles.sharedUsersList}>
            {sharedUsers.map((user) => (
              <div key={user.id} className={styles.sharedUser}>
                <span className={styles.username}>@{user.username}</span>
                <button
                  className={styles.removeButton}
                  onClick={() => removeShare(user.id)}
                  title="Remove share"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestSharing;
