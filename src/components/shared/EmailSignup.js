import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EmailSignup.css";

const EmailSignup = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [currentPhrase, setCurrentPhrase] = useState("United we Code");
  const navigate = useNavigate();

  // Toggle between phrases every 3 seconds
  useEffect(() => {
    const phrases = ["United we Code", "Divided we Debug"];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % phrases.length; // Toggle between 0 and 1
      setCurrentPhrase(phrases[index]);
    }, 3000); // 3000 ms = 3 seconds

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (unchanged submit logic)
  };

  return (
    <section className="email-signup" id="signup">
      <div className="phrase-container">
        {/* Dynamically toggle between "United we Code" and "Divided we Debug" */}
        <p className="phrase">{currentPhrase}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Subscribe</button>
      </form>
      {message && <p className="message">{message}</p>}
    </section>
  );
};

export default EmailSignup;
