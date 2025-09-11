import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sqlite3 from 'sqlite3';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        status TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        notes TEXT,
        quiz TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});


// Google AI Studio setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Routes
app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.post('/api/generate', upload.single('file'), async (req, res) => {
    try {
        const { youtubeUrl } = req.body;
        const file = req.file;

        let prompt = '';

        if (youtubeUrl) {
            // This is a placeholder. In a real app, you'd use a library to get the transcript.
            prompt = `Extract a transcript from the YouTube video at this URL: ${youtubeUrl}. Then, based on the transcript, generate detailed study notes and a quiz with multiple-choice and short-answer questions.`;
        } else if (file) {
            // This is a placeholder. Multimodal capabilities of Gemini 2.5 are not fully available in the public API yet.
            // We will simulate this by using a text-based prompt.
            prompt = `Assume you have received an audio or video file. Transcribe the content, then generate detailed study notes and a quiz with multiple-choice and short-answer questions based on the transcription. The file content is simulated here.`;
        } else {
            return res.status(400).json({ error: 'No YouTube URL or file provided.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt + `
        
        Provide the output in a structured JSON format like this:
        {
          "notes": "string",
          "quiz": [
            { "question": "string", "options": ["a","b","c","d"], "answer": "string" },
            { "question": "string", "answer": "string" }
          ]
        }
        `);
        const response = await result.response;
        const text = await response.text();

        // Clean the response to get valid JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);

        // Save to history
        db.run(`INSERT INTO history (type, content, notes, quiz) VALUES (?, ?, ?, ?)`, 
            [youtubeUrl ? 'youtube' : 'file', youtubeUrl || file.originalname, jsonResponse.notes, JSON.stringify(jsonResponse.quiz)],
            (err) => {
                if (err) {
                    console.error('Failed to save history:', err);
                }
            }
        );

        res.json(jsonResponse);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate content from AI.' });
    }
});

app.get('/api/planner', (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM tasks';
    if (status === 'planned' || status === 'unplanned') {
        query += ` WHERE status = ?`;
    }

    db.all(query, [status], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/planner', (req, res) => {
    const { title, status } = req.body;
    db.run(`INSERT INTO tasks (title, status) VALUES (?, ?)`, [title, status], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, title, status });
    });
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
