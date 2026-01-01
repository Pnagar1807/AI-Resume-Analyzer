const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getAISuggestions = async (resumeText, jobDescription) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "You are an ATS resume expert. Respond in very simple language.",
      },
      {
        role: "user",
        content: `
Analyze the resume and job description below.

Resume:
${resumeText}

Job Description:
${jobDescription}

Give output in this EXACT format:

Missing Skills (max 5, short words):
- skill 1
- skill 2
- skill 3

Resume Improvement Tips (max 3, one line each):
- tip 1
- tip 2
- tip 3

ATS Score Improvement Tips (max 3, short):
- tip 1
- tip 2
- tip 3

Rules:
- Use very simple English
- No long explanations
- No paragraphs
- No extra text
`,
      },
    ],
  });

  return completion.choices[0].message.content;
};

module.exports = getAISuggestions;
