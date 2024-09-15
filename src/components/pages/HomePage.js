import React from "react";
import Header from "../../../src/components/shared/Header";
import Hero from "../../../src/components/shared/Hero";
import Features from "../../../src/components/shared/Features";
import EmailSignup from "../../../src/components/shared/EmailSignup";
import Footer from "../../../src/components/shared/Footer";
import "../../../src/global.css";

const Homepage = () => {
  return (
    <div>
      <Header />
      <Hero />
      <Features />
      <EmailSignup />
      <Footer />
    </div>
  );
};

export default Homepage;
