import jsPDF from "jspdf";

export interface SectionStat {
  total: number;
  correct: number;
}

export interface AptitudePDFData {
  candidateName: string;
  candidateEmail?: string;
  scorePercentage: number;
  totalCorrect: number;
  totalQuestions: number;
  percentile: number;
  timeTakenSeconds: number;
  sectionBreakdown: Record<string, SectionStat>;
  aiAssessment: string;
  timestamp?: string;
}

export function generateAptitudeReportPDF(data: AptitudePDFData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const darkNavy = [15, 23, 42]; // #0F172A
  const royalBlue = [37, 99, 235]; // #2563EB
  const slateGray = [100, 116, 139]; // #64748B
  const lightBg = [248, 250, 252]; // #F8FAFC
  const borderGray = [226, 232, 240]; // #E2E8F0
  const emeraldGreen = [16, 185, 129]; // #10B981

  let y = margin;

  // ── 1. Top Branded Header Banner ──────────────────────────────────────────────
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 4, 4, "F");

  // Logo Mark / Icon
  doc.setFillColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.roundedRect(margin + 6, y + 6, 22, 22, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("HMM", margin + 9, y + 21);

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("HelpMeMan Competency Report", margin + 34, y + 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("Official Aptitude & Problem Solving Assessment", margin + 34, y + 23);

  // Verified Badge
  doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.roundedRect(pageWidth - margin - 38, y + 10, 32, 14, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("VERIFIED", pageWidth - margin - 32, y + 19);

  y += 42;

  // ── 2. Candidate Metadata Bar ──────────────────────────────────────────────
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`Candidate: ${data.candidateName}`, margin + 6, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  if (data.candidateEmail) {
    doc.text(`Email: ${data.candidateEmail}`, margin + 6, y + 17);
  }
  const dateStr = data.timestamp ? new Date(data.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-IN");
  doc.text(`Date: ${dateStr}`, pageWidth - margin - 45, y + 10);
  doc.text(`Test: General Aptitude Mock`, pageWidth - margin - 45, y + 17);

  y += 28;

  // ── 3. Primary Metrics Grid (Score, Percentile, Speed) ────────────────────────
  const cardWidth = (contentWidth - 8) / 3;

  // Metric 1: Overall Score
  doc.setFillColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.roundedRect(margin, y, cardWidth, 34, 4, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("OVERALL SCORE", margin + 6, y + 10);

  doc.setFontSize(22);
  doc.text(`${data.scorePercentage}%`, margin + 6, y + 24);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.totalCorrect} / ${data.totalQuestions} Questions Correct`, margin + 6, y + 30);

  // Metric 2: Estimated Percentile
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.roundedRect(margin + cardWidth + 4, y, cardWidth, 34, 4, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("PERCENTILE RANK", margin + cardWidth + 10, y + 10);

  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(`Top ${100 - data.percentile}%`, margin + cardWidth + 10, y + 24);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text(`Peer Benchmarking Score`, margin + cardWidth + 10, y + 30);

  // Metric 3: Time Elapsed
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin + (cardWidth * 2) + 8, y, cardWidth, 34, 4, 4, "FD");

  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("TIME ELAPSED", margin + (cardWidth * 2) + 14, y + 10);

  const mins = Math.floor(data.timeTakenSeconds / 60);
  const secs = data.timeTakenSeconds % 60;
  doc.setFontSize(22);
  doc.text(`${mins}m ${secs}s`, margin + (cardWidth * 2) + 14, y + 24);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text("Total Exam Pace", margin + (cardWidth * 2) + 14, y + 30);

  y += 42;

  // ── 4. Sectional Breakdown Table ──────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("Sectional Performance Breakdown", margin, y);

  y += 6;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(margin, y, contentWidth, 10, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text("SECTION NAME", margin + 6, y + 7);
  doc.text("QUESTIONS", margin + 80, y + 7);
  doc.text("SCORE", margin + 120, y + 7);
  doc.text("ACCURACY", margin + 155, y + 7);

  y += 10;

  // Table Rows
  const sections = Object.entries(data.sectionBreakdown);
  sections.forEach(([secName, stats], idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, y, contentWidth, 10, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(secName, margin + 6, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text(`${stats.total} Qs`, margin + 80, y + 7);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(`${stats.correct}/${stats.total}`, margin + 120, y + 7);

    const acc = Math.round((stats.correct / stats.total) * 100);
    const accColor = acc >= 75 ? emeraldGreen : acc >= 50 ? royalBlue : [225, 29, 72];
    doc.setTextColor(accColor[0], accColor[1], accColor[2]);
    doc.text(`${acc}%`, margin + 155, y + 7);

    y += 10;
  });

  y += 10;

  // ── 5. AI Competency Diagnostic Box ───────────────────────────────────────
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, y, contentWidth, 36, 4, 4, "FD");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text("AI Diagnostic & Growth Analysis", margin + 8, y + 10);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 58, 138);
  const splitText = doc.splitTextToSize(data.aiAssessment, contentWidth - 16);
  doc.text(splitText, margin + 8, y + 18);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Official HelpMeMan Competency Report • Verification ID: HMM-${Math.floor(100000 + Math.random() * 900000)}`,
    margin,
    pageHeight - 10
  );

  doc.save(`HelpMeMan_Aptitude_Report_${data.candidateName.replace(/\s+/g, "_")}.pdf`);
}
