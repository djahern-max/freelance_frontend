import React, { useState, useEffect, useRef } from "react";
import { XCircle } from "lucide-react";
import styles from "./NoteSharing.module.css";

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
    if (note && note.shared_with) {
      setSharedUsers(
        note.shared_with.map((share) => ({
          id: share.user_id,
          username: share.username,
          can_edit: share.can_edit,
        }))
      );
    } else {
      setSharedUsers([]);
    }
  }, [note]);

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

      // First, search for the user
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

      // Share the note
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

      const responseData = await response.json();
      console.log("Share response:", response.status, responseData);

      if (!response.ok) {
        if (
          response.status === 400 &&
          responseData.detail?.includes("already shared")
        ) {
          setError("Note is already shared with this user");
        } else {
          throw new Error(responseData.detail || "Failed to share note");
        }
        return;
      }

      // Add the new share to the local state
      setSharedUsers((prev) => [
        ...prev,
        {
          id: userToShare.id,
          username: userToShare.username,
          can_edit: true,
        },
      ]);

      setShareUsername("");
      setSuggestions([]);
      setShowSuggestions(false);
      if (onShareComplete) onShareComplete();
    } catch (error) {
      console.error("Share error:", error);
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
      console.log("Removing share - Note ID:", noteId, "User ID:", userId);
      const response = await fetch(
        `${apiUrl}/notes/${noteId}/share/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        console.log("Share removed successfully");
        setSharedUsers((prev) => prev.filter((user) => user.id !== userId));
        if (onShareComplete) onShareComplete();
      } else {
        console.error("Failed to remove share. Status:", response.status);
        const errorText = await response.text();
        console.error("Error details:", errorText);
      }
    } catch (error) {
      console.error("Error removing share:", error);
    }
  };

  return (
    <div className={styles.shareContainer}>
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
          disabled={isLoading}
        >
          {isLoading ? "Sharing..." : "Share"}
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
            {sharedUsers.map((user) => (
              <span key={user.id} className={styles.sharedUser}>
                <span className={styles.username}>@{user.username}</span>
                <XCircle
                  className={styles.removeIcon}
                  onClick={() => removeShare(user.id)}
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
