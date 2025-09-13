import React, { createContext, useState, useContext } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeWrapper from "./components/ThemeWrapper";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Planner from "./pages/Planner";
import Stats from "./pages/Stats";
import User from "./pages/User";
import History from "./pages/History";
import Settings from "./pages/Settings";

export const ErrorContext = createContext();

function App() {
  const [error, setError] = useState(null);

  // Helper function for fetch with 429 error handling
  const fetchWith429Handling = async (...args) => {
    try {
      const res = await fetch(...args);
      if (res.status === 429) {
        setError("Too many requests. Please try again later.");
      }
      return res;
    } catch (e) {
      setError("Failed to fetch. Please ensure the backend server is running.");
      throw e;
    }
  };

  return (
    <ThemeProvider>
      <ThemeWrapper>
        <ErrorContext.Provider
          value={{ error, setError, fetchWith429Handling }}
        >
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <div className="flex">
              <Sidebar />
              <main className="flex-grow p-8 ml-20">
                {error && (
                  <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
                    {error}
                  </div>
                )}
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/planner" element={<Planner />} />
                  <Route
                    path="/stats"
                    element={
                      <ErrorBoundary>
                        <Stats />
                      </ErrorBoundary>
                    }
                  />
                  <Route path="/user" element={<User />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </Router>
        </ErrorContext.Provider>
      </ThemeWrapper>
    </ThemeProvider>
  );
}

// ErrorBoundary class for catching render errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static contextType = ErrorContext;
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    if (this.context && this.context.setError) {
      this.context.setError("Stats section failed to load.");
    }
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export default App;
