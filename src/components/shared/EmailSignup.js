import React, { useState } from "react";
import "./EmailSignup.css"; // Optional for specific styles

const EmailSignup = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email submitted:", email);
  };

  return (
    <section className="email-signup" id="signup">
      <h2>Join the AI Revolution</h2>
      <p>Get updates and insights straight to your inbox.</p>
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
    </section>
  );
};

export default EmailSignup;
