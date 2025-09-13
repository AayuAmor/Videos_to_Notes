import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdateApiKey = async () => {
    setError("");
    setMessage("");
    if (!apiKey.trim()) {
      setError("API Key cannot be empty.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/update-api-key`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ apiKey }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update API key.");
      }

      setMessage(result.message);
      setApiKey(""); // Clear input field on success
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Application Settings</h2>
        <div className="space-y-6">
          {/* Theme Toggle */}
          <div>
            <h3 className="text-lg font-medium mb-2">Theme</h3>
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
              <button
                onClick={toggleTheme}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
                  theme === "dark" ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                    theme === "dark" ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>
          </div>

          {/* API Key Update */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-2">API Key</h3>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter new Gemini API Key"
                  className="w-full bg-gray-200 dark:bg-gray-600 p-2 rounded-md border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleUpdateApiKey}
                  className="ml-4 bg-blue-600 px-4 py-2 rounded-md font-bold hover:bg-blue-700 text-white text-sm"
                >
                  Update Key
                </button>
              </div>
              {message && (
                <p className="text-sm text-green-500 mt-2">{message}</p>
              )}
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
          </div>

          {/* Notifications Placeholder */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-2">Notifications</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Notification preferences will be available here in a future
              update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
