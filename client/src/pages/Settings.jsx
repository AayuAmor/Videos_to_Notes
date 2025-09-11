import React from "react";

const Settings = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Application Settings</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Theme</h3>
            <div className="flex items-center justify-between bg-gray-700 p-4 rounded-md">
              <span>Dark Mode</span>
              <div className="w-12 h-6 flex items-center bg-blue-600 rounded-full p-1">
                <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-6"></div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Theme switching is a future feature.
            </p>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-2">API Key</h3>
            <div className="flex items-center justify-between bg-gray-700 p-4 rounded-md">
              <span>Gemini API Key</span>
              <button className="bg-blue-600 px-4 py-2 rounded-md font-bold hover:bg-blue-700 text-sm">
                Update Key
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Functionality to update the API key will be added later.
            </p>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-2">Notifications</h3>
            <p className="text-gray-400">
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
