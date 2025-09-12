import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import sqlite3 from "sqlite3";
import { YoutubeTranscript } from "youtube-transcript";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the SQLite database.");
});

const dbSchema = `
  DROP TABLE IF EXISTS study_plans;
  
  CREATE TABLE IF NOT EXISTS study_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    video_url TEXT,
    process_time DATETIME,
    note_format TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Not Started',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    notes TEXT,
    quiz TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

db.exec(dbSchema, (err) => {
  if (err) {
    console.error("Error initializing database:", err.message);
  } else {
    console.log("Database tables created or already exist.");
    // Start the background processor only after the database is ready
    setInterval(processDueStudyPlans, 60 * 1000);
    console.log("Background study plan processor started.");
  }
});

// Google AI Studio setup
let genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Routes
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.post("/api/generate", upload.single("file"), async (req, res) => {
  try {
    const { youtubeUrl } = req.body;
    const file = req.file;

    let prompt;
    let sourceType = "";
    let sourceIdentifier = "";

    const jsonPromptStructure = `
            Your response MUST be a valid JSON object with the following structure:
            {
              "notes": "A string containing detailed, well-structured study notes.",
              "quiz": [
                { "question": "A multiple-choice question", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "The correct option" },
                { "question": "A short-answer question", "answer": "The correct answer" }
              ]
            }
            Do not include any other text, markdown, or formatting outside of this single JSON object.
        `;

    if (youtubeUrl) {
      sourceType = "youtube";
      sourceIdentifier = youtubeUrl;
      try {
        // First, try to fetch the transcript. It's faster and more reliable if available.
        const transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl);
        const transcriptText = transcript.map((item) => item.text).join(" ");
        console.log("Successfully fetched YouTube transcript.");
        prompt = `
                    Based on the following transcript from a YouTube video, generate detailed study notes and a quiz.
                    The quiz should include a mix of multiple-choice and short-answer questions.
                    Transcript: "${transcriptText}"
                    ${jsonPromptStructure}
                `;
      } catch (error) {
        // If transcript fails, fall back to multimodal analysis of the video URL.
        console.warn(
          `Failed to fetch transcript: ${error.message}. Falling back to multimodal analysis with Gemini 1.5 Pro.`
        );
        prompt = `
                    **TASK: Directly analyze the video content from the provided YouTube URL and generate study materials. DO NOT mention transcripts. Your analysis must be based on the video's visual and audio information ONLY.**

                    **VIDEO URL:** ${youtubeUrl}

                    **ACTION:**
                    1.  Watch and understand the video at the URL.
                    2.  Generate detailed, well-structured study notes summarizing the key topics and concepts.
                    3.  Create a quiz with a mix of multiple-choice and short-answer questions that test understanding of the video's content.

                    **OUTPUT FORMAT:**
                    You must respond with ONLY a single, valid JSON object. Do not include any other text, markdown, or introductory phrases.

                    ${jsonPromptStructure}
                `;
      }
    } else if (file) {
      // Placeholder for actual file processing with a multimodal model.
      sourceType = "file";
      sourceIdentifier = file.originalname;
      const simulatedContent = `Simulated content from uploaded file: ${file.originalname}. The user wants notes and a quiz from this.`;
      prompt = `
                Based on the following text, generate detailed study notes and a quiz.
                Text to process: "${simulatedContent}"
                ${jsonPromptStructure}
            `;
    } else {
      return res
        .status(400)
        .json({ error: "No YouTube URL or file provided." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    let jsonResponse;
    try {
      const cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      jsonResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse JSON from AI response:", parseError);
      console.error("Raw AI response:", text);
      return res.status(500).json({
        error: "The AI returned an invalid format. Please try again.",
      });
    }

    // Save to history
    db.run(
      `INSERT INTO history (type, content, notes, quiz) VALUES (?, ?, ?, ?)`,
      [
        sourceType,
        sourceIdentifier,
        jsonResponse.notes,
        JSON.stringify(jsonResponse.quiz),
      ],
      (err) => {
        if (err) {
          console.error("Failed to save history:", err);
        }
      }
    );

    res.json(jsonResponse);
  } catch (error) {
    console.error("Error in /api/generate:", error);
    // Check if the error is a Google API error with a 429 status
    if (
      error.status === 429 ||
      (error.message && error.message.includes("429"))
    ) {
      return res.status(429).json({
        error:
          "API quota exceeded. Please check your billing or upgrade your plan.",
      });
    }
    res
      .status(500)
      .json({ error: "An unexpected error occurred on the server." });
  }
});

app.post("/api/update-api-key", (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({ error: "API key cannot be empty." });
  }

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    let envFileContent = fs.readFileSync(envPath, { encoding: "utf8" });

    const key = "GEMINI_API_KEY";
    const regex = new RegExp(`^${key}=.*`, "m");

    if (regex.test(envFileContent)) {
      envFileContent = envFileContent.replace(regex, `${key}=${apiKey}`);
    } else {
      envFileContent += `\n${key}=${apiKey}`;
    }

    fs.writeFileSync(envPath, envFileContent);

    // Re-initialize the GoogleGenerativeAI instance with the new key
    process.env.GEMINI_API_KEY = apiKey;
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    console.log("Successfully updated and re-initialized API Key.");
    res.json({ message: "API Key updated successfully!" });
  } catch (error) {
    console.error("Failed to update .env file:", error);
    res.status(500).json({ error: "Failed to update API key on the server." });
  }
});

// CRUD for Study Plans
app.post("/api/study-plans", (req, res) => {
  const { title, video_url, process_time, note_format, status } = req.body;

  db.run(
    `INSERT INTO study_plans (title, video_url, process_time, note_format, status) VALUES (?, ?, ?, ?, ?)`,
    [title, video_url, process_time, note_format, status || "Not Started"],
    function (err) {
      if (err) {
        console.error("DB Error on POST /api/study-plans:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, ...req.body });
    }
  );
});

app.get("/api/study-plans", (req, res) => {
  db.all(
    `SELECT * FROM study_plans ORDER BY process_time ASC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.put("/api/study-plans/:id", (req, res) => {
  const { title, video_url, process_time, note_format, status } = req.body;
  const { id } = req.params;

  db.run(
    `UPDATE study_plans SET title = ?, video_url = ?, process_time = ?, note_format = ?, status = ? WHERE id = ?`,
    [title, video_url, process_time, note_format, status, id],
    function (err) {
      if (err) {
        console.error(`DB Error on PUT /api/study-plans/${id}:`, err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Study plan not found" });
      }
      res.json({ id, ...req.body });
    }
  );
});

app.delete("/api/study-plans/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM study_plans WHERE id = ?`, id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Study plan not found" });
    }
    res.status(204).send(); // No content
  });
});

app.get("/api/history", (req, res) => {
  db.all(`SELECT * FROM history ORDER BY createdAt DESC`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get("/api/stats", async (req, res) => {
  try {
    const notesGenerated = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM history", (err, row) => {
        if (err) reject(err);
        resolve(row ? row.count : 0);
      });
    });

    const plansCreated = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM study_plans", (err, row) => {
        if (err) reject(err);
        resolve(row ? row.count : 0);
      });
    });

    const plansCompleted = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as count FROM study_plans WHERE status = 'Completed'",
        (err, row) => {
          if (err) reject(err);
          resolve(row ? row.count : 0);
        }
      );
    });

    const plansPending = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as count FROM study_plans WHERE status = 'Pending'",
        (err, row) => {
          if (err) reject(err);
          resolve(row ? row.count : 0);
        }
      );
    });

    res.json({
      notesGenerated,
      tasksCreated: plansCreated, // Renamed for consistency on the frontend
      tasksCompleted: plansCompleted,
      tasksPending: plansPending,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Background task processor
const processDueStudyPlans = async () => {
  console.log("Checking for due study plans...");
  const now = new Date().toISOString();

  db.all(
    `SELECT * FROM study_plans WHERE process_time <= ? AND status = 'Pending'`,
    [now],
    async (err, plans) => {
      if (err) {
        console.error("Error fetching due plans:", err);
        return;
      }

      if (plans.length === 0) {
        console.log("No due plans found.");
        return;
      }

      for (const plan of plans) {
        console.log(`Processing plan ID: ${plan.id} - ${plan.title}`);

        // 1. Update status to 'Processing'
        db.run(
          `UPDATE study_plans SET status = 'Processing' WHERE id = ?`,
          plan.id
        );

        try {
          // 2. Generate notes (re-using the /generate logic)
          // This is a simplified version. A real app would refactor the generation logic
          // into a function that can be called from multiple places.
          const { notes, quiz } = await generateContentForPlan(plan);

          // 3. Save to history
          db.run(
            `INSERT INTO history (type, content, notes, quiz) VALUES (?, ?, ?, ?)`,
            ["study_plan", plan.video_url, notes, JSON.stringify(quiz)]
          );

          // 4. Update status to 'Completed'
          db.run(
            `UPDATE study_plans SET status = 'Completed' WHERE id = ?`,
            plan.id
          );
          console.log(
            `Successfully processed and completed plan ID: ${plan.id}`
          );
        } catch (processingError) {
          console.error(
            `Failed to process plan ID: ${plan.id}`,
            processingError
          );
          // Revert status to 'Pending' or set to 'Failed'
          db.run(
            `UPDATE study_plans SET status = 'Failed' WHERE id = ?`,
            plan.id
          );
        }
      }
    }
  );
};

// Helper function to encapsulate generation logic for the background task
async function generateContentForPlan(plan) {
  const { video_url, note_format } = plan;

  const jsonPromptStructure = `
        Your response MUST be a valid JSON object with the following structure:
        {
          "notes": "A string containing detailed, well-structured study notes in ${note_format} format.",
          "quiz": [
            { "question": "A multiple-choice question", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "The correct option" },
            { "question": "A short-answer question", "answer": "The correct answer" }
          ]
        }
        Do not include any other text, markdown, or formatting outside of this single JSON object.
    `;

  let prompt;
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(video_url);
    const transcriptText = transcript.map((item) => item.text).join(" ");
    prompt = `Based on the following transcript, generate study notes in ${note_format} format and a quiz. Transcript: "${transcriptText}" ${jsonPromptStructure}`;
  } catch (error) {
    console.warn(
      `Transcript fetch failed for ${video_url}. Falling back to multimodal.`
    );
    prompt = `Directly analyze the video at ${video_url}. Generate study notes in ${note_format} format and a quiz. ${jsonPromptStructure}`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    // Check for quota errors and re-throw a specific error message
    if (
      error.status === 429 ||
      (error.message && error.message.includes("429"))
    ) {
      console.error(`Quota exceeded for plan ID: ${plan.id}.`);
      throw new Error("API quota exceeded. The plan will be retried later.");
    }
    // For other errors, throw a generic message
    throw new Error(`Failed to generate content from AI: ${error.message}`);
  }
}

// Run the processor every minute
// setInterval(processDueStudyPlans, 60 * 1000);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
