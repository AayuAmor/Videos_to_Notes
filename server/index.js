import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sqlite3 from 'sqlite3';
import { YoutubeTranscript } from 'youtube-transcript';

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

        let prompt;
        let contentToProcess = '';
        let sourceType = '';
        let sourceIdentifier = '';

        if (youtubeUrl) {
            try {
                const transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl);
                contentToProcess = transcript.map(item => item.text).join(' ');
                sourceType = 'youtube';
                sourceIdentifier = youtubeUrl;
            } catch (error) {
                console.error('Failed to fetch YouTube transcript:', error);
                return res.status(400).json({ error: 'Failed to fetch transcript from the provided YouTube URL. Please check the URL and try again.' });
            }
        } else if (file) {
            // Placeholder for file processing. For now, we'll use a simulated text prompt.
            // In a real implementation, you would use a speech-to-text API here for audio/video files.
            contentToProcess = `Simulated content from uploaded file: ${file.originalname}. The user wants notes and a quiz from this.`;
            sourceType = 'file';
            sourceIdentifier = file.originalname;
        } else {
            return res.status(400).json({ error: 'No YouTube URL or file provided.' });
        }

        if (!contentToProcess) {
            return res.status(400).json({ error: 'Could not extract any content to process.' });
        }

        prompt = `
            Based on the following text, generate detailed study notes and a quiz.
            The quiz should include a mix of multiple-choice questions (with 4 options) and short-answer questions.

            Text to process: "${contentToProcess}"

            Your response MUST be a valid JSON object with the following structure:
            {
              "notes": "A string containing detailed, well-structured study notes.",
              "quiz": [
                { "question": "string", "options": ["string", "string", "string", "string"], "answer": "string" },
                { "question": "string", "answer": "string" }
              ]
            }
            Do not include any other text or formatting outside of this JSON structure.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        let jsonResponse;
        try {
            // Clean the response to get valid JSON
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            jsonResponse = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('Failed to parse JSON from AI response:', parseError);
            console.error('Raw AI response:', text);
            return res.status(500).json({ error: 'The AI returned an invalid format. Please try again.' });
        }

        // Save to history
        db.run(`INSERT INTO history (type, content, notes, quiz) VALUES (?, ?, ?, ?)`, 
            [sourceType, sourceIdentifier, jsonResponse.notes, JSON.stringify(jsonResponse.quiz)],
            (err) => {
                if (err) {
                    console.error('Failed to save history:', err);
                }
            }
        );

        res.json(jsonResponse);

    } catch (error) {
        console.error('Error in /api/generate:', error);
        res.status(500).json({ error: 'An unexpected error occurred on the server.' });
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
