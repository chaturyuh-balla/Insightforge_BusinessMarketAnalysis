import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadReportPdf(activeReport) {
  if (!activeReport) return;
  const report = activeReport.report_json;
  const doc = new jsPDF();
  let y = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('InsightForge AI Report', 14, y);
  y += 9;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Query: ${activeReport.query}`, 14, y);
  y += 10;

  y = addSection(doc, 'Executive Summary', [report.executiveSummary], y);
  y = addSection(doc, 'Market Research Report', [
    report.marketResearch.industryOverview,
    `Market Size: ${report.marketResearch.marketSizeClassification}`,
    ...report.marketResearch.growthTrends,
    ...report.marketResearch.customerSegments,
    ...report.marketResearch.painPoints,
    ...report.marketResearch.risksChallenges,
    ...report.marketResearch.emergingTechnologies
  ], y);
  y = addSection(doc, 'SWOT Analysis', Object.entries(report.strategicAnalysis.swot).flatMap(([key, values]) => [`${title(key)}:`, ...values]), y);
  y = addSection(doc, 'Competitor Analysis', Object.values(report.strategicAnalysis.competitors).flat(), y);
  y = addSection(doc, 'Pricing Analysis', [report.strategicAnalysis.pricing.model, ...Object.values(report.strategicAnalysis.pricing).flat().slice(1)], y);
  y = addSection(doc, 'Go-To-Market Strategy', Object.values(report.strategicAnalysis.goToMarket).flat(), y);
  y = addSection(doc, 'Critic Review', Object.values(report.critic).flat(), y);

  doc.addPage();
  autoTable(doc, {
    head: [['Citation', 'Title', 'URL']],
    body: report.citations.map((item) => [item.label, item.title, item.url]),
    styles: { fontSize: 8, cellWidth: 'wrap' },
    columnStyles: { 2: { cellWidth: 85 } }
  });

  doc.save(`InsightForge-${activeReport.query.replace(/[^a-z0-9]/gi, '-')}.pdf`);
}

function addSection(doc, heading, lines, y) {
  if (y > 245) {
    doc.addPage();
    y = 18;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(heading, 14, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  lines.filter(Boolean).forEach((line) => {
    const wrapped = doc.splitTextToSize(`- ${line}`, 180);
    if (y + wrapped.length * 5 > 280) {
      doc.addPage();
      y = 18;
    }
    doc.text(wrapped, 16, y);
    y += wrapped.length * 5 + 1;
  });
  return y + 3;
}

function title(value) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}
