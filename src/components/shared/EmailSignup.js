import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EmailSignup.css";

const EmailSignup = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [showBuildIt, setShowBuildIt] = useState(false);
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
    let cycleInterval;
    let phraseIndex = 0;

    const rotatePhrases = () => {
      setShowBuildIt(false);
      phraseInterval = setInterval(() => {
        setCurrentPhrase(phraseIndex);
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }, 250);
    };

    const showBuildIt = () => {
      clearInterval(phraseInterval);
      setShowBuildIt(true);
    };

    const startCycle = () => {
      cycleInterval = setInterval(() => {
        rotatePhrases();
        setTimeout(showBuildIt, 10000);
      }, 20000);
    };

    rotatePhrases();
    startCycle();

    return () => {
      clearInterval(phraseInterval);
      clearInterval(cycleInterval);
    };
  }, [phrases.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (unchanged submit logic)
  };

  return (
    <section className="email-signup" id="signup">
      <div className="phrase-container">
        <p className={`phrase ${showBuildIt ? "build-it-text" : ""}`}>
          {showBuildIt ? "BUILD IT!" : phrases[currentPhrase]}
        </p>
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
