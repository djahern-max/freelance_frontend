// src/components/dashboards/CommandNotesDashboard.js
import React, { useState, useEffect } from "react";
import { PlusCircle, Tag, Save, X, Copy, Trash } from "lucide-react";
import styles from "./CommandNotes.module.css";

const apiUrl = process.env.REACT_APP_API_URL;

export function CommandNoteForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [commands, setCommands] = useState([""]);
  const [tags, setTags] = useState([""]);
  const [currentTag, setCurrentTag] = useState("");

  const handleAddCommand = () => {
    setCommands([...commands, ""]);
  };

  const handleCommandChange = (index, value) => {
    const newCommands = [...commands];
    newCommands[index] = value;
    setCommands(newCommands);
  };

  const handleRemoveCommand = (index) => {
    const newCommands = commands.filter((_, i) => i !== index);
    setCommands(newCommands);
  };

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags.filter((t) => t !== ""), currentTag]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      title,
      description,
      commands: commands.filter((cmd) => cmd.trim() !== ""),
      tags: tags.filter((tag) => tag.trim() !== ""),
    };

    try {
      const response = await fetch(`${apiUrl}/command_notes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setTitle("");
        setDescription("");
        setCommands([""]);
        setTags([""]);
        alert("Commands saved successfully!");
      } else {
        alert("Failed to save commands");
      }
    } catch (error) {
      console.error("Error saving commands:", error);
      alert("Error saving commands");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.title}>Save Command Notes</h1>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Commands</label>
          {commands.map((command, index) => (
            <div key={index} className={styles.commandRow}>
              <input
                type="text"
                value={command}
                onChange={(e) => handleCommandChange(index, e.target.value)}
                className={styles.commandInput}
                placeholder="Command"
              />
              <button
                type="button"
                onClick={() => handleRemoveCommand(index)}
                className={styles.removeButton}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddCommand}
            className={styles.addButton}
          >
            + Add Command
          </button>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tags</label>
          <div className={styles.commandRow}>
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              className={styles.input}
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className={styles.addButton}
            >
              +
            </button>
          </div>
          <div className={styles.tagContainer}>
            {tags
              .filter((tag) => tag !== "")
              .map((tag, index) => (
                <span key={index} className={styles.tag}>
                  <Tag size={14} />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className={styles.removeButton}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
          </div>
        </div>

        <button type="submit" className={styles.saveButton}>
          <Save size={20} />
          Save Commands
        </button>
      </form>
    </div>
  );
}

export function CommandNotesList() {
  const [notes, setNotes] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    fetchNotes();
  }, [selectedTag]);

  const fetchNotes = async () => {
    try {
      const url = selectedTag
        ? `${apiUrl}/command_notes/?tag=${selectedTag}`
        : `${apiUrl}/command_notes/`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`${apiUrl}/command_notes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div>
      <h2 className={styles.title}>Saved Commands</h2>

      {notes.map((note) => (
        <div key={note.id} className={styles.commandCard}>
          <div className={styles.commandCardHeader}>
            <h3 className={styles.commandCardTitle}>{note.title}</h3>
            <button
              onClick={() => deleteNote(note.id)}
              className={styles.removeButton}
            >
              <Trash size={20} />
            </button>
          </div>

          {note.description && (
            <p className={styles.description}>{note.description}</p>
          )}

          <div className={styles.commandList}>
            {note.commands.map((command, index) => (
              <div key={index} className={styles.commandItem}>
                <code className={styles.commandText}>{command}</code>
                <button
                  onClick={() => copyToClipboard(command)}
                  className={styles.addButton}
                >
                  <Copy size={16} />
                </button>
              </div>
            ))}
          </div>

          {note.tags?.length > 0 && (
            <div className={styles.tagContainer}>
              {note.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  <Tag size={14} />
                  {tag}ds
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
