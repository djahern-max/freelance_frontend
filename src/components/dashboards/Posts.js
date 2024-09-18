import React, { useState, useEffect } from "react";
import "./Posts.css";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newPost, setNewPost] = useState({ title: "", content: "" });

  // Fetch posts based on the search term
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/posts?search=${searchTerm}`);
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts", error);
      }
    };
    fetchPosts();
  }, [searchTerm]);

  // Handle the post submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });
      if (response.ok) {
        setNewPost({ title: "", content: "" });
        setSearchTerm(""); // Reset search after posting
      }
    } catch (error) {
      console.error("Error creating post", error);
    }
  };

  // Handle voting on posts
  const handleVote = async (postId, direction) => {
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ post_id: postId, dir: direction }),
      });
      if (response.ok) {
        const updatedPosts = posts.map((post) => {
          if (post.id === postId) {
            return { ...post, votes: post.votes + (direction === 1 ? 1 : -1) };
          }
          return post;
        });
        setPosts(updatedPosts);
      }
    } catch (error) {
      console.error("Error voting on post", error);
    }
  };

  return (
    <div className="posts-container">
      <h1>Ask a Question</h1>

      <div className="search-section">
        <h2>Search Questions</h2>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-fields">
          <input
            type="text"
            placeholder="Post Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Content"
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
            required
          />
        </div>
        <button type="submit">Submit Post</button>
      </form>

      <h2>Questions Asked</h2>
      <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className="post-item">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <p>Votes: {post.votes}</p>
            <button onClick={() => handleVote(post.id, 1)}>Like</button>
            <button onClick={() => handleVote(post.id, 0)}>Unlike</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;
