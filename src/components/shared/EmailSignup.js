import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EmailSignup.css";

const EmailSignup = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [showBuildIt, setShowBuildIt] = useState(false); // Tracks when to show "BUILD IT!"
  const navigate = useNavigate();

  // Phrases to rotate
  const phrases = [
    "Embrace Change",
    "Accept Challenge",
    "Create a Masterpiece",
    "Welcome Transformation",
    "Adapt to Growth",
    "Thrive in Transition",
    "Embrace Evolution",
    "Flow with Change",
    "Accept the New",
    "Change is Progress",
    "Ride the Waves of Change",
    "Evolve with Time",
    "Open to New Possibilities",
    "Flourish Through Change",
    "Shift Your Perspective",
    "Embrace the Unknown",
    "Leap Into the Future",
    "Move Forward Fearlessly",
    "Grow Through Change",
    "Accept Transformation",
    "Be Open to New Beginnings",
    "Change Brings Opportunity",
    "Step Into New Horizons",
    "Embrace Progress",
    "Go with the Flow of Life",
    "Let Change Inspire You",
    "Celebrate New Phases",
    "Change Brings Growth",
    "Shift to Thrive",
    "Transformation is Power",
    "Adapt and Flourish",
    "See Change as Growth",
    "Welcome Shifts with Grace",
    "Change Sparks Evolution",
    "Transition with Strength",
    "Transform with Confidence",
    "Accept What Is Coming",
    "Evolve Bravely",
    "Lean into Change",
    "Growth is Change",
    "Embrace New Paths",
    "Change is Opportunity",
    "Open to Evolution",
    "Rise to the Occasion",
    "Face Obstacles Head-On",
    "Overcome Your Limits",
    "Conquer the Difficult",
    "Challenge Yourself",
    "Take on the Impossible",
    "Step Into Adversity",
    "Face Challenges Boldly",
    "Meet Resistance with Strength",
    "Push Beyond Boundaries",
    "Break Through Barriers",
    "Go Beyond Your Comfort Zone",
    "Master the Struggle",
    "Take on the Tough Stuff",
    "Defy the Odds",
    "Conquer Every Challenge",
    "Face the Uncomfortable",
    "Chase Difficulties",
    "Embrace Adversity",
    "Accept the Test",
    "Overcome Setbacks",
    "Meet Challenges Head-On",
    "Defeat What’s Difficult",
    "Tackle the Obstacles",
    "Face Fears with Courage",
    "Pursue the Challenge",
    "Conquer What’s Tough",
    "Rise Above Limits",
    "Test Your Resolve",
    "Push Yourself Further",
    "Boldly Face Resistance",
    "Strength in Struggle",
    "Power Through Obstacles",
    "Embrace Tough Moments",
    "Accept the Journey",
    "Test Your Strength",
    "Face Hurdles Fearlessly",
    "Embrace the Struggle",
    "Take on Life’s Tests",
    "Grow Through Challenge",
    "Craft Something Great",
    "Build a Work of Art",
    "Create Your Legacy",
    "Make Your Mark",
    "Shape Brilliance",
    "Bring Your Vision to Life",
    "Craft Your Best Work",
    "Create Something Amazing",
    "Design Something Extraordinary",
    "Build a Lasting Impact",
    "Form a Masterwork",
    "Create Excellence",
    "Manifest Greatness",
    "Sculpt Your Dream",
    "Build Your Masterpiece",
    "Achieve Creative Brilliance",
    "Construct with Purpose",
    "Design Your Best Work",
    "Bring Forth Greatness",
    "Make Something Incredible",
  ];

  useEffect(() => {
    let phraseInterval;
    let buildItTimeout;

    // Start the rotation of phrases
    const startPhraseRotation = () => {
      phraseInterval = setInterval(() => {
        setCurrentPhrase((prevPhrase) => (prevPhrase + 1) % phrases.length);
      }, 50); // Rotate phrases every second (adjust as needed)
    };

    // Function to show "BUILD IT!" for 10 seconds
    const showBuildItPhase = () => {
      setShowBuildIt(true); // Show "BUILD IT!"
      clearInterval(phraseInterval); // Stop phrase rotation
      buildItTimeout = setTimeout(() => {
        setShowBuildIt(false); // Go back to phrase rotation
        startPhraseRotation();
      }, 10000); // Show "BUILD IT!" for 10 seconds
    };

    // Start phrase rotation
    startPhraseRotation();

    // Cycle between showing phrases for 20 seconds, then "BUILD IT!" for 10 seconds
    const cycleInterval = setInterval(() => {
      showBuildItPhase();
    }, 10000); // Total 30 seconds (20 seconds of phrases + 10 seconds of "BUILD IT!")

    return () => {
      clearInterval(phraseInterval);
      clearInterval(cycleInterval);
      clearTimeout(buildItTimeout);
    };
  }, [phrases.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        navigate("/newsletter-dashboard", { state: { email } });
      } else {
        const data = await response.json();
        setMessage(data.detail || "Something went wrong!");
      }
    } catch (error) {
      setMessage("Failed to subscribe. Please try again later.");
    }
  };

  return (
    <section className="email-signup" id="signup">
      <p
        className={showBuildIt ? "build-it-text" : ""}
        style={
          showBuildIt
            ? { fontFamily: "Poppins, sans-serif", fontWeight: 700 }
            : {}
        }
      >
        {showBuildIt ? "BUILD IT!" : phrases[currentPhrase]}
      </p>{" "}
      {/* Rotating phrases or "BUILD IT!" */}
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
      {message && <p>{message}</p>} {/* Display success/error message */}
    </section>
  );
};

export default EmailSignup;
