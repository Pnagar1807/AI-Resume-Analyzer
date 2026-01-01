const matchSkills = (resumeSkills, jobDesc) => {
  const jd = jobDesc.toLowerCase();

  const matched = resumeSkills.filter(skill =>
    jd.includes(skill)
  );

  const missing = resumeSkills.filter(skill =>
    !jd.includes(skill)
  );

  const score = resumeSkills.length === 0
    ? 0
    : Math.round((matched.length / resumeSkills.length) * 100);

  return {
    score,
    missingSkills: missing,
  };
};

module.exports = matchSkills;
