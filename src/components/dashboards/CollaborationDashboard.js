import React from "react";
import { useNavigate } from "react-router-dom";
import "./CollaborationDashboard.css"; // Ensure this CSS is updated similarly to NewsletterDashboard.css
import LoggedinHeader from "../../components/shared/LoggedinHeader";

import podcastIcon from "../../images/podcast.png"; // Placeholder for icons if needed
import schoolIcon from "../../images/school.png";
import chatIcon from "../../images/chat.png";
import logoutIcon from "../../images/Logout.png";

const CollaborationDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/"); // Redirect to login after logout
  };

  const handleNavigation = (path) => {
    navigate(path); // Navigate to different paths if needed
  };

  // const today = new Date().toLocaleDateString("en-US", {
  //   weekday: "long",
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  // });

  return (
    <div>
      <div className="collaboration-dashboard-wrapper">
        <div className="collaboration-dashboard">
          <div className="collaboration-header">
            {/* Icons similar to NewsletterDashboard */}
            <div className="icon-links">
              <img
                src={podcastIcon}
                alt="Podcast"
                className="icon"
                onClick={() => handleNavigation("/podcasts-dashboard")}
              />
              <img
                src={schoolIcon}
                alt="School"
                className="icon"
                onClick={() => handleNavigation("/tutorials-dashboard")}
              />
              <img
                src={chatIcon}
                alt="Chat"
                className="icon"
                onClick={() => handleNavigation("/collaboration-dashboard")}
              />
              <img
                src={logoutIcon}
                alt="Logout"
                className="icon"
                onClick={handleLogout}
              />
            </div>

            {/* <h1>{today}</h1> */}
            <p className="headline">Ask a Question</p>
          </div>

          <div className="collaboration-content">
            {/* <div className="search-section">
              <h2>Search Questions</h2>
              <input type="text" placeholder="Search posts..." />
            </div> */}

            <form className="post-form">
              <div className="form-fields">
                <label htmlFor="postTitle">Post Title</label>
                <input
                  type="text"
                  id="postTitle"
                  placeholder="Post Title"
                  required
                />
              </div>

              <div className="form-fields">
                <label htmlFor="content">Content</label>
                <textarea id="content" placeholder="Content" required />
              </div>

              <button type="submit">Submit Post</button>
            </form>

            {/* <h2>Questions Asked</h2> */}
            {/* Questions list would go here */}
          </div>

          {/* <div className="logout-container">
            <button onClick={handleLogout} className="logout-button">
              Exit
            </button> */}
        </div>
      </div>
    </div>
  );
};

export default CollaborationDashboard;
