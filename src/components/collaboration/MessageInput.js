// MessageInput.js
// Input area for new messages
import React, { useState, useRef } from 'react';
import styles from './MessageInput.module.css';

export const MessageInput = ({ onSendMessage, disabled = false }) => {
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (message.trim() !== '' || attachments.length > 0) {
            onSendMessage(message.trim(), attachments);
            setMessage('');
            setAttachments([]);
        }
    };

    const handleAttachment = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);

        // In a real implementation, this would upload files to your server
        // and return file metadata. For this example, we'll simulate it.
        const uploadedFiles = files.map(file => ({
            id: `temp-${Date.now()}-${file.name}`,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            // In real implementation, this would be the server path
            file_path: URL.createObjectURL(file)
        }));

        setAttachments(prev => [...prev, ...uploadedFiles]);
        setUploading(false);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <form className={styles.messageInput} onSubmit={handleSubmit}>
            {attachments.length > 0 && (
                <div className={styles.attachmentPreview}>
                    {attachments.map(attachment => (
                        <div key={attachment.id} className={styles.attachmentItem}>
                            <span className={styles.attachmentName}>{attachment.file_name}</span>
                            <button
                                type="button"
                                className={styles.removeAttachment}
                                onClick={() => setAttachments(prev =>
                                    prev.filter(a => a.id !== attachment.id)
                                )}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.inputArea}>
                <textarea
                    className={styles.textInput}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={disabled ? "This session is resolved" : "Type your message..."}
                    disabled={disabled || uploading}
                    rows={3}
                />

                <div className={styles.inputActions}>
                    <button
                        type="button"
                        className={styles.attachButton}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || uploading}
                    >
                        Attach File
                    </button>

                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={disabled || uploading || (message.trim() === '' && attachments.length === 0)}
                    >
                        Send
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className={styles.fileInput}
                    onChange={handleAttachment}
                    multiple
                    disabled={disabled || uploading}
                />
            </div>
        </form>
    );
};