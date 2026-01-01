const skillsList = [
  "javascript",
  "react",
  "node",
  "express",
  "mongodb",
  "html",
  "css",
  "tailwind",
  "java",
  "python",
  "sql",
  "git",
  "github",
  "api",
  "rest",
];

const extractSkills = (text) => {
  const lowerText = text.toLowerCase();
  const foundSkills = skillsList.filter(skill =>
    lowerText.includes(skill)
  );

  return [...new Set(foundSkills)];
};

module.exports = extractSkills;
