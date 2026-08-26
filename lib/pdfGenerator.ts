import jsPDF from "jspdf";

export interface ConsultationPDFData {
  bookingId?: string;
  threadId?: string;
  menteeName: string;
  menteeEmail?: string;
  mentorName: string;
  mentorRole?: string;
  mentorCompany?: string;
  categoryName?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  status?: string;
  userNotes?: string;
  mentorNotes?: string;
  aiBriefSummary?: string;
  chatHighlights?: string[];
  amountPaid?: number;
  currency?: string;
}

export function generateConsultationPDF(data: ConsultationPDFData): void {
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
  const primaryColor = [15, 23, 42]; // #0F172A Dark Slate
  const brandBlue = [37, 99, 235]; // #2563EB Royal Blue
  const accentGray = [100, 116, 139]; // #64748B Slate Gray
  const lightBg = [248, 250, 252]; // #F8FAFC
  const borderGray = [226, 232, 240]; // #E2E8F0

  let y = margin;

  // ── 1. Top Header Banner ───────────────────────────────────────────
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Accent Line under header
  doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  doc.rect(0, 28, pageWidth, 2, "F");

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("HelpMeMan", margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(191, 219, 254); // Light blue tint
  doc.text("Official Consultation Summary Report", margin + 36, 18);

  // Issued Date right aligned
  const issuedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Issued: ${issuedDate}`, pageWidth - margin, 18, { align: "right" });

  y = 38;

  // ── 2. Document Title & Badge ─────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Consultation Summary & Key Takeaways", margin, y);

  y += 7;
  const refId = data.bookingId || data.threadId || `HMM-${Math.floor(100000 + Math.random() * 900000)}`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(accentGray[0], accentGray[1], accentGray[2]);
  doc.text(`Ref ID: #${refId.slice(-10).toUpperCase()}   |   Status: Verified Consultation`, margin, y);

  y += 10;

  // ── 3. Participants & Session Overview Grid Box ────────────────────
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 42, 3, 3, "FD");

  let boxY = y + 7;

  // Mentee Column
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  doc.text("STUDENT / MENTEE", margin + 6, boxY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(data.menteeName || "Mentee", margin + 6, boxY + 6);

  if (data.menteeEmail) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(accentGray[0], accentGray[1], accentGray[2]);
    doc.text(data.menteeEmail, margin + 6, boxY + 11);
  }

  // Mentor Column
  const col2X = margin + (contentWidth / 2) - 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  doc.text("VERIFIED MENTOR", col2X, boxY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(data.mentorName || "Mentor", col2X, boxY + 6);

  const mentorSub = [data.mentorRole, data.mentorCompany].filter(Boolean).join(" • ");
  if (mentorSub) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(accentGray[0], accentGray[1], accentGray[2]);
    doc.text(mentorSub.length > 35 ? mentorSub.slice(0, 32) + "..." : mentorSub, col2X, boxY + 11);
  }

  // Divider inside box
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(margin + 5, boxY + 17, margin + contentWidth - 5, boxY + 17);

  // Row 2 inside box: Date, Time & Category
  const row2Y = boxY + 23;
  const formattedDate = data.scheduledAt
    ? new Date(data.scheduledAt).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "Completed Consultation Session";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(accentGray[0], accentGray[1], accentGray[2]);
  doc.text("SESSION DATE & TIME:", margin + 6, row2Y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(formattedDate, margin + 43, row2Y);

  if (data.categoryName || data.durationMinutes) {
    const metaRight = [data.categoryName, data.durationMinutes ? `${data.durationMinutes} Minutes` : null].filter(Boolean).join(" | ");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accentGray[0], accentGray[1], accentGray[2]);
    doc.text(metaRight, margin + contentWidth - 6, row2Y, { align: "right" });
  }

  y += 50;

  // Helper for adding multi-line sections
  const addSection = (title: string, content: string | string[], iconText: string = "•") => {
    if (!content || (Array.isArray(content) && content.length === 0)) return;

    // Check page break space
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin + 10;
    }

    // Section Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(title, margin, y);
    y += 3;

    doc.setDrawColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 25, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85); // Slate 700

    if (Array.isArray(content)) {
      content.forEach((item) => {
        const lines = doc.splitTextToSize(`${iconText}  ${item}`, contentWidth - 5);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4.5 + 2;
      });
    } else {
      const lines = doc.splitTextToSize(content, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 4.5 + 4;
    }

    y += 4;
  };

  // ── 4. Key Takeaways & AI Brief Summary ───────────────────────────
  if (data.aiBriefSummary) {
    addSection("AI Consultation Summary & Insights", data.aiBriefSummary);
  }

  if (data.mentorNotes) {
    addSection("Mentor Recommendations & Action Plan", data.mentorNotes);
  }

  if (data.userNotes) {
    addSection("Mentee Consultation Focus & Goals", data.userNotes);
  }

  if (data.chatHighlights && data.chatHighlights.length > 0) {
    addSection("Key Discussion Highlights", data.chatHighlights, "✓");
  }

  // Fallback if no specific notes provided
  if (!data.aiBriefSummary && !data.mentorNotes && !data.userNotes && (!data.chatHighlights || data.chatHighlights.length === 0)) {
    addSection(
      "Consultation Summary",
      `This consultation session between ${data.menteeName} and verified mentor ${data.mentorName} was successfully conducted on HelpMeMan. Mentee received 1-on-1 personalized guidance, strategic roadmap advice, and direct feedback customized to their goals.`
    );
  }

  // ── 5. Footer & Verification Stamp ────────────────────────────────
  const footerY = Math.max(y + 15, pageHeight - 35);

  // Footer Divider
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY, margin + contentWidth, footerY);

  // Seal / Badge Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  doc.text("VERIFIED BY HELPMEMAN", margin, footerY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(accentGray[0], accentGray[1], accentGray[2]);
  doc.text("HelpMeMan Platform — Connecting Students with Elite Verified Mentors", margin, footerY + 11);
  doc.text("Need support? Email us at support@helpmeman.com or visit www.helpmeman.com", margin, footerY + 16);

  // Watermark stamp text on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("AUTHENTIC RECORD", margin + contentWidth, footerY + 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(`Doc ID: ${refId}`, margin + contentWidth, footerY + 11, { align: "right" });

  // Save the PDF file
  const fileName = `HelpMeMan-Consultation-${refId.slice(-8)}.pdf`;
  doc.save(fileName);
}
