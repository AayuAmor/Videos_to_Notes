import React from "react";
import { useTheme } from "../contexts/ThemeContext";

// This wrapper applies the theme class to the app root
const ThemeWrapper = ({ children }) => {
  const { theme } = useTheme();
  return (
    <div
      className={
        theme === "dark"
          ? "dark bg-gray-900 text-white"
          : "bg-white text-gray-900"
      }
    >
      {children}
    </div>
  );
};

export default ThemeWrapper;
