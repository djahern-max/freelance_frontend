import React from "react";
import HomeHeader from "../../../src/components/shared/HomeHeader";

import Features from "../../../src/components/shared/Features";

import "../../../src/global.css";

const Homepage = () => {
  return (
    <div>
      <HomeHeader />
      {/* <Hero /> */}
      <Features />
      {/* <EmailSignup />
      <Footer /> */}
    </div>
  );
};

export default Homepage;
