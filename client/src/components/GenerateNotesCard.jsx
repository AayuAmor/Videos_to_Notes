import React, { useState } from "react";

const GenerateNotesCard = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    if (youtubeUrl) {
      formData.append("youtubeUrl", youtubeUrl);
    }
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await fetch("http://localhost:8080/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            error: "Failed to generate notes. Please check the server logs.",
          }));
        throw new Error(errorData.error || "Network response was not ok");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg w-full mt-8">
      <h2 className="text-xl font-bold mb-4">Generate Notes</h2>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Paste a YouTube URL here"
          className="bg-gray-700 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          disabled={loading}
        />
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer ${
              loading ? "bg-gray-800" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                {file ? (
                  `File: ${file.name}`
                ) : (
                  <>
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Audio or Video file
              </p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={loading}
            />
          </label>
        </div>
        <button
          className="bg-blue-600 w-full py-3 rounded-md font-bold hover:bg-blue-700 disabled:bg-blue-400"
          onClick={handleGenerate}
          disabled={loading || (!youtubeUrl && !file)}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 font-bold">
            Failed to generate notes. Please try again.
          </p>
          <div className="mt-2 p-2 bg-black/20 rounded text-xs text-red-300">
            <p className="font-bold">For Developers:</p>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        </div>
      )}
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Generated Notes:</h3>
          <div className="bg-gray-700 p-4 rounded-md mb-4">
            <p>{result.notes}</p>
          </div>
          <h3 className="text-lg font-bold mb-2">Quiz:</h3>
          <div className="bg-gray-700 p-4 rounded-md">
            {result.quiz.map((q, index) => (
              <div key={index} className="mb-4">
                <p className="font-semibold">
                  {index + 1}. {q.question}
                </p>
                {q.options && (
                  <ul className="list-disc list-inside ml-4">
                    {q.options.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                )}
                <p className="text-sm text-green-400 mt-1">
                  Answer: {q.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateNotesCard;
