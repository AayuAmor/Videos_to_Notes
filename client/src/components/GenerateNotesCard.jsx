import React from 'react';

const GenerateNotesCard = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg w-full mt-8">
      <h2 className="text-xl font-bold mb-4">Generate Notes</h2>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Paste a YouTube URL here"
          className="bg-gray-700 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Audio or Video file</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" />
            </label>
        </div> 
        <button className="bg-blue-600 w-full py-3 rounded-md font-bold hover:bg-blue-700">
          Generate
        </button>
      </div>
    </div>
  );
};

export default GenerateNotesCard;
