import React from "react";
import KPJLandingAnimation from "../assets/KPJLandingAnimation.gif";

const LandingAnimation = ({ onFinish }) => {
  React.useEffect(() => {
    const timer = setTimeout(onFinish, 7700); // Show animation for 2.5 seconds
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={KPJLandingAnimation}
        alt="Landing Animation"
        style={{
          maxWidth: "60vw",
          maxHeight: "60vh",
          borderRadius: 24,
          boxShadow: "0 4px 32px #22223b33",
        }}
      />
    </div>
  );
};

export default LandingAnimation;
