import React, { useState, useEffect } from "react";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/history");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError("Failed to fetch history.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading history...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-8">Generation History</h1>
      <div className="space-y-6">
        {history.length > 0 ? (
          history.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-lg shadow border border-gray-200 dark:border-none rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-400">
                  <span className="font-bold capitalize">{item.type}: </span>
                  <a
                    href={item.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline truncate"
                  >
                    {item.content}
                  </a>
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Notes:</h3>
                <p className="p-3 rounded-md text-sm mb-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                  {item.notes}
                </p>
                <h3 className="text-lg font-bold mb-2">Quiz:</h3>
                <div className="p-3 rounded-md text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                  {JSON.parse(item.quiz).map((q, index) => (
                    <div key={index} className="mb-3">
                      <p className="font-semibold">
                        {index + 1}. {q.question}
                      </p>
                      {q.options && (
                        <ul className="list-disc list-inside ml-4 text-gray-300">
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
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-10">No history found.</p>
        )}
      </div>
    </div>
  );
};

export default History;
