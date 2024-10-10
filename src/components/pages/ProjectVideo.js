import React, { useEffect, useState } from "react";
import axios from "axios";

const ProjectVideo = ({ projectId }) => {
  const [projectVideo, setProjectVideo] = useState(null);
  const [subVideos, setSubVideos] = useState([]);

  useEffect(() => {
    // Fetch project video
    axios
      .get(`/videos/${projectId}`)
      .then((response) => setProjectVideo(response.data));

    // Fetch related sub-videos
    axios
      .get(`/videos/${projectId}/sub_videos`)
      .then((response) => setSubVideos(response.data));
  }, [projectId]);

  return (
    <div>
      {projectVideo && (
        <div>
          <h2>{projectVideo.title}</h2>
          <video controls src={projectVideo.file_path}></video>
          <p>{projectVideo.description}</p>
        </div>
      )}
      <h3>Related Tutorials</h3>
      <div>
        {subVideos.map((video) => (
          <div key={video.id}>
            <h4>{video.title}</h4>
            <video
              width="320"
              height="240"
              controls
              src={video.file_path}
            ></video>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectVideo;
