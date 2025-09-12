require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });

app.post("/api/generate", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // A temporary path to store the uploaded file
  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  const tempFilePath = path.join(tempDir, req.file.originalname);

  try {
    // Write the buffer from multer to a temporary file
    fs.writeFileSync(tempFilePath, req.file.buffer);

    console.log(`Uploading file: ${req.file.originalname}`);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Upload the file to Google's servers
    const uploadedFile = await genAI.uploadFile(tempFilePath, {
      mimeType: req.file.mimetype,
      displayName: req.file.originalname,
    });

    console.log(
      `Uploaded file '${uploadedFile.displayName}' as: ${uploadedFile.uri}`
    );

    const prompt =
      "Summarize this content and generate detailed, well-structured notes from it. Use headings, bullet points, and key takeaways.";

    // Pass the file reference to the model
    const result = await model.generateContent([
      prompt,
      {
        fileData: {
          mimeType: uploadedFile.mimeType,
          fileUri: uploadedFile.uri,
        },
      },
    ]);
    const response = await result.response;
    const text = response.text();

    res.json({ notes: text });
  } catch (error) {
    console.error("Error generating notes with Google AI:", error);
    res
      .status(500)
      .send("Failed to generate notes. Check server logs for details.");
  } finally {
    // Clean up the temporary file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
