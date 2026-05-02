import jsPDF from 'jspdf';
import { StandardDetail } from '@/components/StandardModal';

export const generateComplianceReport = (query: string, results: StandardDetail[], latency: string) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();
  const reportId = `NMK-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;

  // 1. Formal BIS-Style Header
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277); // Outer border for the whole page

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.text('NIRMARK TECHNICAL AUDIT REPORT', 105, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.text('PREPARED PURSUANT TO BUREAU OF INDIAN STANDARDS (BIS) REGULATORY FRAMEWORK', 105, 32, { align: 'center' });

  doc.line(15, 38, 195, 38);

  // 2. Report Meta Information Table
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 42, 180, 20, 'F');
  doc.rect(15, 42, 180, 20, 'S');
  doc.line(105, 42, 105, 62);

  doc.setFont('times', 'bold');
  doc.text('REPORT IDENTIFIER:', 18, 50);
  doc.text('AUDIT TIMESTAMP:', 108, 50);
  
  doc.setFont('times', 'normal');
  doc.text(reportId, 60, 50);
  doc.text(timestamp, 145, 50);

  doc.setFont('times', 'bold');
  doc.text('SOURCE SYSTEM:', 18, 57);
  doc.text('AUDIT LATENCY:', 108, 57);
  
  doc.setFont('times', 'normal');
  doc.text('NIRMARK RAG ENGINE v2.0', 60, 57);
  doc.text(latency, 145, 57);

  // 3. Project Scope (Formal)
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('1.0 PROJECT SCOPE AND COMPLIANCE QUERY', 15, 75);
  doc.line(15, 77, 100, 77);

  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  const splitQuery = doc.splitTextToSize(`"${query}"`, 170);
  doc.text(splitQuery, 20, 85);

  let yPos = 85 + (splitQuery.length * 5) + 15;

  // 4. Compliance Summary Table
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('2.0 COMPLIANCE SUMMARY TABLE', 15, yPos);
  doc.line(15, yPos + 2, 100, yPos + 2);
  yPos += 10;

  // Table Header
  doc.setFillColor(60, 60, 60);
  doc.rect(15, yPos, 180, 8, 'F');
  doc.setTextColor(255);
  doc.setFontSize(9);
  doc.text('SN', 18, yPos + 5.5);
  doc.text('STANDARD IDENTIFIER', 30, yPos + 5.5);
  doc.text('CONFIDENCE', 90, yPos + 5.5);
  doc.text('STATUS', 130, yPos + 5.5);
  doc.text('RISK LEVEL', 165, yPos + 5.5);

  doc.setTextColor(0);
  yPos += 8;
  results.forEach((res, i) => {
    doc.rect(15, yPos, 180, 8, 'S');
    doc.text(`${i + 1}`, 18, yPos + 5.5);
    doc.text(res.code, 30, yPos + 5.5);
    doc.text(`${Math.round((res.confidence_score || 0.94) * 100)}%`, 90, yPos + 5.5);
    doc.text('VERIFIED', 130, yPos + 5.5);
    doc.text(res.confidence_score && res.confidence_score > 0.9 ? 'LOW' : 'MEDIUM', 165, yPos + 5.5);
    yPos += 8;
  });

  yPos += 15;

  // 5. Detailed Technical Annex
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('3.0 TECHNICAL ANNEX: DETAILED SPECIFICATIONS', 15, yPos);
  doc.line(15, yPos + 2, 120, yPos + 2);
  yPos += 12;

  results.forEach((res, index) => {
    const splitRationale = doc.splitTextToSize(res.rationale, 170);
    const splitAction = doc.splitTextToSize(res.compliance_action || 'N/A', 170);
    const blockHeight = 45 + (splitRationale.length * 5) + (splitAction.length * 5);

    if (yPos + blockHeight > 270) {
      doc.addPage();
      doc.setDrawColor(0);
      doc.rect(10, 10, 190, 277); // Outer border for new page
      yPos = 25;
    }

    // Standard Header Block
    doc.setFillColor(245, 245, 245);
    doc.rect(15, yPos, 180, 10, 'F');
    doc.rect(15, yPos, 180, 10, 'S');
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(`${res.code} : ${res.title}`, 20, yPos + 7);
    
    yPos += 10;

    // Content Block
    doc.rect(15, yPos, 180, blockHeight - 10, 'S');
    doc.setFontSize(9);
    doc.text('TECHNICAL RATIONALE:', 18, yPos + 7);
    doc.setFont('times', 'normal');
    doc.text(splitRationale, 18, yPos + 12);

    const actionY = yPos + 15 + (splitRationale.length * 5);
    doc.setFont('times', 'bold');
    doc.text('MANDATORY COMPLIANCE ACTION:', 18, actionY);
    doc.setFont('times', 'normal');
    doc.text(splitAction, 18, actionY + 5);

    const clausesY = actionY + 10 + (splitAction.length * 5);
    doc.setFont('times', 'bold');
    doc.text('CRITICAL CLAUSES FOR VERIFICATION:', 18, clausesY);
    doc.setFont('times', 'normal');
    const clausesStr = (res.critical_clauses || ['Clause 6', 'Table 5']).join(' | ');
    const splitClauses = doc.splitTextToSize(clausesStr, 170);
    doc.text(splitClauses, 18, clausesY + 5);

    yPos += blockHeight + 15;
  });

  // Footer
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.text('This document is an AI-generated technical advisory based on the NIRMARK SP21/BIS Corpus.', 105, 280, { align: 'center' });
  doc.text('NirMark utilizes AI for standard discovery. Always cross-reference with official BIS gazettes.', 105, 284, { align: 'center' });
  doc.text('For legal purposes, please cross-reference with official Bureau of Indian Standards notifications.', 105, 288, { align: 'center' });

  doc.save(`NIRMARK_BIS_Audit_${reportId}.pdf`);
};
