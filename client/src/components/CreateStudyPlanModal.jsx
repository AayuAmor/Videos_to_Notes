import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateStudyPlanModal = ({ isOpen, onClose, onSave, existingPlan }) => {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [processTime, setProcessTime] = useState(new Date());
  const [noteFormat, setNoteFormat] = useState("Summary");

  useEffect(() => {
    if (existingPlan) {
      setTitle(existingPlan.title || "");
      setVideoUrl(existingPlan.video_url || "");
      setProcessTime(
        existingPlan.process_time
          ? new Date(existingPlan.process_time)
          : new Date()
      );
      setNoteFormat(existingPlan.note_format || "Summary");
    } else {
      // Reset form when opening for a new plan
      setTitle("");
      setVideoUrl("");
      setProcessTime(new Date());
      setNoteFormat("Summary");
    }
  }, [existingPlan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a title for the task.");
      return;
    }

    const planData = {
      id: existingPlan?.id,
      title,
      video_url: videoUrl,
      note_format: noteFormat,
      // If processTime is in the future, it's 'Planned', otherwise 'Not Started'
      status: processTime > new Date() ? "Planned" : "Not Started",
      process_time: processTime > new Date() ? processTime.toISOString() : null,
    };

    onSave(planData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">
          {existingPlan ? "Edit Study Plan" : "Add New Task"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="plan-title"
              className="block text-sm font-medium mb-2"
            >
              Task Title
            </label>
            <input
              id="plan-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 'Review Quantum Physics Lecture'"
              className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="video-url"
              className="block text-sm font-medium mb-2"
            >
              Video URL (Optional)
            </label>
            <input
              id="video-url"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="process-time"
              className="block text-sm font-medium mb-2"
            >
              Processing Date & Time (Optional)
            </label>
            <DatePicker
              id="process-time"
              selected={processTime}
              onChange={(date) => setProcessTime(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="note-format"
              className="block text-sm font-medium mb-2"
            >
              Note Format
            </label>
            <select
              id="note-format"
              value={noteFormat}
              onChange={(e) => setNoteFormat(e.target.value)}
              className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Summary</option>
              <option>Bullet Points</option>
              <option>Q&A</option>
              <option>Flashcards</option>
            </select>
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
              {existingPlan ? "Save Changes" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudyPlanModal;
