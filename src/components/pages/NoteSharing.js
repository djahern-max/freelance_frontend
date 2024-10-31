import React, { useState, useEffect, useRef } from "react";
import { XCircle } from "lucide-react";
import styles from "./NoteSharing.module.css";
// import CommandDisplay from "../shared/CommandDisplay";

const NoteSharing = ({
  noteId,
  token,
  apiUrl,
  onShareComplete,
  note,
  toggleNotePrivacy,
}) => {
  const [shareUsername, setShareUsername] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    fetchSharedUsers();
    // Add click outside listener
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [noteId]);

  const fetchSharedUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/notes/${noteId}/shares`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSharedUsers(Array.isArray(data) ? data : data.shared_with || []);
      } else {
        setSharedUsers([]);
      }
    } catch (error) {
      console.error("Error fetching shared users:", error);
      setSharedUsers([]);
    }
  };

  const searchUsers = async (query) => {
    if (!query.startsWith("@")) return;
    const searchTerm = query.slice(1);

    try {
      const response = await fetch(
        `${apiUrl}/notes/users/search?q=${searchTerm}`,
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
      console.error("Error searching users:", error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setShareUsername(value);

    if (value.includes("@")) {
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
    setError("");

    try {
      const username = shareUsername.startsWith("@")
        ? shareUsername.slice(1)
        : shareUsername;

      const userSearchResponse = await fetch(
        `${apiUrl}/notes/users/search?q=${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!userSearchResponse.ok) {
        throw new Error("User not found");
      }

      const users = await userSearchResponse.json();
      const userToShare = users.find((u) => u.username === username);

      if (!userToShare) {
        throw new Error("User not found");
      }

      const response = await fetch(`${apiUrl}/notes/${noteId}/share`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shared_with_user_id: userToShare.id,
          can_edit: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to share note");
      }

      setShareUsername("");
      setSuggestions([]);
      setShowSuggestions(false);
      await fetchSharedUsers();
      if (onShareComplete) onShareComplete();
    } catch (error) {
      setError(
        error.message ||
          "Failed to share note. Please check the username and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeShare = async (userId) => {
    try {
      const response = await fetch(
        `${apiUrl}/notes/${noteId}/share/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        await fetchSharedUsers();
        if (onShareComplete) onShareComplete();
      }
    } catch (error) {
      console.error("Error removing share:", error);
    }
  };

  return (
    <div className={styles.shareContainer}>
      {/* <CommandDisplay text={note.content} /> */}
      <div className={styles.shareControls}>
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            className={styles.shareInput}
            value={shareUsername}
            onChange={handleInputChange}
            placeholder="@username to share with"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className={styles.suggestionsDropdown}>
              {suggestions.map((user) => (
                <div
                  key={user.id}
                  className={styles.suggestionItem}
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
          disabled={isLoading || !shareUsername}
        >
          {isLoading ? "Sharing..." : "Share"}
        </button>

        <button
          className={`${styles.privacyToggle} ${
            note.is_public ? styles.public : styles.private
          }`}
          onClick={() => toggleNotePrivacy(note.id, note.is_public)}
        >
          {note.is_public ? "Make Private" : "Make Public"}
        </button>
        <label className={styles.toggleSwitch}>
          <input
            type="checkbox"
            checked={note.is_public}
            onChange={() => toggleNotePrivacy(note.id, note.is_public)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {sharedUsers && sharedUsers.length > 0 && (
        <div className={styles.sharedWithSection}>
          <div className={styles.sharedWithTitle}>Shared with:</div>
          <div className={styles.sharedUsersList}>
            {sharedUsers.map((share) => (
              <span key={share.id} className={styles.sharedUser}>
                <span className={styles.username}>@{share.username}</span>
                <XCircle
                  className={styles.removeIcon}
                  onClick={() => removeShare(share.user_id)}
                />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default NoteSharing;
