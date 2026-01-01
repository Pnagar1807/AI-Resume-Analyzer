import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

export const generatePDFReport = async (data, fileName = 'resume-analysis-report') => {
  const {
    score,
    skills = [],
    missingSkills = [],
    aiSuggestions = '',
    jobDescSummary = '',
    fileName: resumeFileName = '',
    analysisDate = new Date().toISOString()
  } = data;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header with gradient effect
  doc.setFillColor(59, 130, 246); // Blue-500
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Resume Analysis Report', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date(analysisDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, 35, { align: 'center' });

  // Resume Info
  yPos = 60;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resume Information', 20, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`File: ${resumeFileName || 'Not specified'}`, 20, yPos);
  
  yPos += 6;
  doc.text(`Analysis Date: ${new Date(analysisDate).toLocaleString()}`, 20, yPos);

  // ATS Score Section
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ATS Compatibility Score', 20, yPos);
  
  yPos += 10;
  
  // Draw score circle
  const scoreX = pageWidth / 2;
  const scoreY = yPos + 20;
  
  // Outer circle
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1);
  doc.circle(scoreX, scoreY, 25, 'S');
  
  // Inner circle with color based on score
  if (score >= 80) {
    doc.setFillColor(34, 197, 94); // Green
  } else if (score >= 60) {
    doc.setFillColor(234, 179, 8); // Yellow
  } else {
    doc.setFillColor(239, 68, 68); // Red
  }
  doc.circle(scoreX, scoreY, 20, 'F');
  
  // Score text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${score}%`, scoreX, scoreY + 3, { align: 'center' });
  
  // Score label
  doc.setFontSize(10);
  doc.text('Match Score', scoreX, scoreY + 15, { align: 'center' });

  yPos += 60;

  // Score interpretation
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  const interpretation = getScoreInterpretation(score);
  const splitInterpretation = doc.splitTextToSize(interpretation, pageWidth - 40);
  doc.text(splitInterpretation, 20, yPos);

  // Skills Analysis
  yPos += splitInterpretation.length * 5 + 10;
  
  if (skills.length > 0 || missingSkills.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Skills Analysis', 20, yPos);
    
    yPos += 10;

    // Found Skills
    if (skills.length > 0) {
      doc.setFontSize(12);
      doc.text(`Found Skills (${skills.length})`, 20, yPos);
      yPos += 6;
      
      const foundSkillsTable = skills.map(skill => [skill]);
      doc.autoTable({
        startY: yPos,
        head: [['Skill']],
        body: foundSkillsTable,
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
        theme: 'grid',
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Missing Skills
    if (missingSkills.length > 0) {
      doc.setFontSize(12);
      doc.text(`Missing Skills (${missingSkills.length})`, 20, yPos);
      yPos += 6;
      
      const missingSkillsTable = missingSkills.map(skill => [skill]);
      doc.autoTable({
        startY: yPos,
        head: [['Missing Skill']],
        body: missingSkillsTable,
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        theme: 'grid',
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 }
      });
    }
  }

  // AI Suggestions
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 40;
  doc.addPage();
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AI-Powered Recommendations', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const splitSuggestions = doc.splitTextToSize(aiSuggestions, pageWidth - 40);
  doc.text(splitSuggestions, 20, 30);

  // Job Description Summary
  if (jobDescSummary) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Job Description Summary', 20, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitJobDesc = doc.splitTextToSize(jobDescSummary, pageWidth - 40);
    doc.text(splitJobDesc, 20, 30);
  }

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} • AI Resume Analyzer • ${resumeFileName || 'Report'}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    // Watermark
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text('AI', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
  }

  // Save PDF
  doc.save(`${fileName}.pdf`);
};

const getScoreInterpretation = (score) => {
  if (score >= 80) {
    return '✓ Excellent: Your resume is highly compatible with ATS systems and recruiters can easily find your qualifications. Keep up the good work!';
  } else if (score >= 60) {
    return '⚠️ Good: Your resume has potential but could be optimized for better visibility in ATS systems. Consider adding missing keywords and improving formatting.';
  } else {
    return '✗ Needs Improvement: Your resume may struggle to pass through ATS filters. Consider significant improvements including adding relevant keywords, quantifying achievements, and improving structure.';
  }
};

// Export as image
export const exportAsImage = async (elementId, fileName = 'resume-analysis') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  // Hide buttons and other non-essential elements for the screenshot
  const buttons = element.querySelectorAll('button');
  const originalDisplay = [];
  buttons.forEach(button => {
    originalDisplay.push(button.style.display);
    button.style.display = 'none';
  });

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Make sure cloned version also hides buttons
        const clonedButtons = clonedDoc.querySelectorAll('button');
        clonedButtons.forEach(button => {
          button.style.display = 'none';
        });
      }
    });

    const link = document.createElement('a');
    link.download = `${fileName}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Image export failed:', error);
    throw error;
  } finally {
    // Restore button visibility
    buttons.forEach((button, index) => {
      button.style.display = originalDisplay[index];
    });
  }
};