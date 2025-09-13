import React from "react";

const User = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      <div className="p-8 rounded-lg shadow border border-gray-200 dark:border-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
            <span className="text-4xl">🧑‍💻</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Guest User</h2>
            <p className="text-gray-400">guest@example.com</p>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-xl font-bold mb-4">Account Details</h3>
          <p className="text-gray-400">
            This is a placeholder user profile. In a full application, this page
            would display user information, account settings, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default User;
