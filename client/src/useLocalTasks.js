import { useState, useEffect } from "react";

const TASKS_KEY = "planner_tasks";
const HISTORY_KEY = "planner_history";

export function useLocalTasks() {
  // Load tasks from localStorage
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    } catch {
      return [];
    }
  });

  // Load history from localStorage
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Task CRUD
  const addTask = (task) => setTasks((prev) => [...prev, task]);
  const updateTask = (id, updates) =>
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((task) => task.id !== id));

  // History CRUD
  const addHistory = (entry) => setHistory((prev) => [...prev, entry]);
  const updateHistory = (id, updates) =>
    setHistory((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  const deleteHistory = (id) =>
    setHistory((prev) => prev.filter((entry) => entry.id !== id));

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    history,
    addHistory,
    updateHistory,
    deleteHistory,
  };
}
