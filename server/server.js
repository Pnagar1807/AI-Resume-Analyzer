require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const parseResume = require("./utils/parseResume");
const extractSkills = require("./utils/extractSkills");
const matchSkills = require("./utils/matchSkills");
const getAISuggestions = require("./utils/aiSuggestions");

const app = express();
const PORT = 5000;
console.log("GROQ KEY:", process.env.GROQ_API_KEY ? "LOADED" : "NOT LOADED");


// =====================
// Middlewares
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// Test Route
// =====================
app.get("/", (req, res) => {
  res.send("AI Resume Analyzer Backend Running");
});


// =====================
// Ensure uploads folder exists
// =====================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// =====================
// Multer configuration
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});


// =====================
// Upload & Analyze Resume
// =====================
app.post("/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription || "";

    const resumeText = await parseResume(req.file.path);
    const skills = extractSkills(resumeText);

    const { score, missingSkills } = matchSkills(skills, jobDescription);

    // 🔥 AI Suggestions
    const aiSuggestions = await getAISuggestions(
      resumeText.substring(0, 3000), // limit tokens (important)
      jobDescription
    );

    res.json({
      message: "Resume analyzed successfully",
      preview: resumeText.substring(0, 300),
      skills,
      score,
      missingSkills,
      aiSuggestions,
    });
  } catch (error) {
    console.error("Analysis error:", error.message);
    res.status(500).json({ message: "Resume analysis failed" });
  }
});


// =====================
// Start Server
// =====================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
