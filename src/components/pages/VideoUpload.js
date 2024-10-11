import React, { useState } from "react";
import axios from "axios";

const VideoUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [isProject, setIsProject] = useState(false);

  // Fetch the API URL from environment variables
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("is_project", isProject);
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${apiUrl}/videos/`, // Use the API URL from environment variables
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  return (
    <div>
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>File:</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="video/*"
            required
          />
        </div>
        <div>
          <label>Is Project:</label>
          <input
            type="checkbox"
            checked={isProject}
            onChange={() => setIsProject(!isProject)}
          />
        </div>
        <button type="submit">Upload Video</button>
      </form>
    </div>
  );
};

export default VideoUpload;
