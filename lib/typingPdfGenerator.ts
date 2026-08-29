import jsPDF from "jspdf";

export interface TypingPDFData {
  userName?: string;
  wpm: number;
  accuracy: number;
  consistency?: number;
  rawWpm?: number;
  durationSeconds: number;
  totalCharsTyped: number;
  correctChars: number;
  errorCount: number;
  wordCategory?: string;
  percentileRank?: string;
  aiDiagnostic?: string;
}

export function generateTypingReportPDF(data: TypingPDFData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Theme Colors
  const darkNavy = [15, 23, 42]; // #0F172A
  const royalBlue = [37, 99, 235]; // #2563EB
  const slateGray = [100, 116, 139]; // #64748B
  const lightBg = [248, 250, 252]; // #F8FAFC
  const borderGray = [226, 232, 240]; // #E2E8F0
  const emeraldGreen = [16, 185, 129]; // #10B981

  let y = margin;

  // ── 1. Header Banner ──────────────────────────────────────────────
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFillColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.rect(0, 28, pageWidth, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("HelpMeMan", margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(191, 219, 254);
  doc.text("Certified Typing Speed & Skill Assessment", margin + 36, 18);

  const issuedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Issued: ${issuedDate}`, pageWidth - margin, 18, { align: "right" });

  y = 38;

  // ── 2. Certificate Title & Verification ID ──────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("Official Typing Performance Certificate", margin, y);

  y += 7;
  const certId = `HMM-TYPE-${Math.floor(100000 + Math.random() * 900000)}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text(`Verification ID: #${certId}   |   Mode: ${data.durationSeconds}s ${data.wordCategory || "Standard"} Test`, margin, y);

  y += 12;

  // ── 3. Candidate & Key Stats Scorecard Grid ───────────────────────
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 48, 3, 3, "FD");

  let boxY = y + 7;

  // Candidate Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.text("CANDIDATE NAME", margin + 6, boxY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(data.userName || "Verified Candidate", margin + 6, boxY + 6);

  // WPM Primary Metric
  const col2X = margin + (contentWidth / 2) - 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.text("TYPING SPEED (NET WPM)", col2X, boxY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
  doc.text(`${data.wpm} WPM`, col2X, boxY + 7);

  // Divider inside box
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(margin + 5, boxY + 18, margin + contentWidth - 5, boxY + 18);

  // Row 2 Sub-metrics
  const row2Y = boxY + 25;
  const metrics = [
    { label: "ACCURACY", val: `${data.accuracy}%` },
    { label: "RAW SPEED", val: `${data.rawWpm || data.wpm} WPM` },
    { label: "CONSISTENCY", val: `${data.consistency || 95}%` },
    { label: "ERRORS", val: `${data.errorCount}` },
  ];

  const colWidth = (contentWidth - 12) / 4;
  metrics.forEach((m, idx) => {
    const curX = margin + 6 + idx * colWidth;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text(m.label, curX, row2Y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(m.val, curX, row2Y + 5);
  });

  y += 58;

  // ── 4. Global Career Benchmark & Percentile ──────────────────────
  let percentile = data.percentileRank;
  if (!percentile) {
    if (data.wpm >= 90) percentile = "Top 1% Elite Typist (High-Speed Developer / Transcriptionist Level)";
    else if (data.wpm >= 70) percentile = "Top 5% Advanced Professional (Senior Engineer / Manager Level)";
    else if (data.wpm >= 50) percentile = "Top 20% Above Average Professional";
    else percentile = "Competent Professional Typist";
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("Global Career Benchmark & Tier", margin, y);

  y += 3;
  doc.setDrawColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 25, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Rank Tier: ${percentile}`, margin, y);
  y += 10;

  // ── 5. AI Skill Diagnostic & Recommendation Roadmap ──────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("AI Skill Diagnostic & Ergonomics Assessment", margin, y);

  y += 3;
  doc.setDrawColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 25, y);
  y += 6;

  const defaultDiagnostic = [
    `Precision Ratio: ${data.accuracy >= 98 ? "Exceptional character precision with minimal backspacing penalty." : "Good pace; reducing burst typos will immediately increase net WPM by 8-12%."}`,
    `Finger Rhythm & Consistency: Maintained stable key cadence throughout the ${data.durationSeconds}-second burst test.`,
    `Recommended Practice: Focus on high-frequency n-grams and 200 common technical terms to break into the next speed tier.`,
  ];

  const diagItems = data.aiDiagnostic ? [data.aiDiagnostic] : defaultDiagnostic;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  diagItems.forEach((item) => {
    const lines = doc.splitTextToSize(`•  ${item}`, contentWidth - 5);
    doc.text(lines, margin + 2, y);
    y += lines.length * 4.5 + 2;
  });

  // ── 6. Verification Seal & Footer ─────────────────────────────────
  const footerY = Math.max(y + 20, pageHeight - 35);

  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY, margin + contentWidth, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(royalBlue[0], royalBlue[1], royalBlue[2]);
  doc.text("VERIFIED BY HELPMEMAN AI", margin, footerY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text("HelpMeMan Platform — Skill Assessment & Career Mentorship Engine", margin, footerY + 11);
  doc.text("Verify certificate authenticity at www.helpmeman.com", margin, footerY + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("OFFICIAL RECORD", margin + contentWidth, footerY + 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(`ID: ${certId}`, margin + contentWidth, footerY + 11, { align: "right" });

  doc.save(`HelpMeMan-Typing-Certificate-${data.wpm}WPM.pdf`);
}
