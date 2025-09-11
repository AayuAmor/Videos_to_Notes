import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({ title, dueDate });
    setTitle("");
    setDueDate(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Add New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="task-title"
              className="block text-sm font-medium mb-2"
            >
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="due-date"
              className="block text-sm font-medium mb-2"
            >
              Due Date (Optional)
            </label>
            <DatePicker
              id="due-date"
              selected={dueDate}
              onChange={(date) => setDueDate(date)}
              placeholderText="Select a date"
              className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="yyyy/MM/dd"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 px-6 py-2 rounded-md font-bold hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 px-6 py-2 rounded-md font-bold hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
