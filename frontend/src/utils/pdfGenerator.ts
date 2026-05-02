import jsPDF from 'jspdf';
import { StandardDetail } from '@/components/StandardModal';

export const generateComplianceReport = (query: string, results: StandardDetail[], latency: string) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const reportId = `NMK-BIS-${Math.floor(Math.random() * 900000) + 100000}-${new Date().getFullYear()}`;

  // Helper: Draw a professional header on each page
  const drawPageBorder = () => {
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287); // Outer border
    doc.setLineWidth(0.1);
    doc.rect(7, 7, 196, 283); // Inner decorative border
  };

  const drawHeader = (pageNum: number) => {
    drawPageBorder();
    
    // Logo / Branding Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(30, 41, 59);
    doc.text('NIRMARK', 15, 20);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('BIS STANDARDS INTELLIGENCE PLATFORM', 15, 25);

    // Official Report Tag
    doc.setFillColor(30, 41, 59);
    doc.rect(140, 12, 55, 15, 'F');
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TECHNICAL AUDIT', 167.5, 19, { align: 'center' });
    doc.setFontSize(7);
    doc.text(`ID: ${reportId}`, 167.5, 24, { align: 'center' });
    
    doc.setTextColor(0);
    doc.setDrawColor(200);
    doc.line(10, 35, 200, 35);
  };

  drawHeader(1);

  // 1. Meta Information Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('AUDIT LOG INFORMATION', 15, 45);
  
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 48, 180, 24, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, 48, 180, 24, 'S');

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('GENERATED ON:', 20, 55);
  doc.text('SYSTEM LATENCY:', 20, 61);
  doc.text('REGULATORY DATASET:', 20, 67);
  
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(timestamp, 60, 55);
  doc.text(latency, 60, 61);
  doc.text('SP21/BIS COMPLIANCE CORPUS v3.0 (PRO)', 60, 67);

  // 2. Project Scope Section
  doc.setFontSize(12);
  doc.text('1.0 PROJECT SCOPE & COMPLIANCE QUERY', 15, 85);
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(1);
  doc.line(15, 87, 30, 87);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const splitQuery = doc.splitTextToSize(`Target Query: "${query}"`, 170);
  doc.text(splitQuery, 15, 95);

  let yPos = 95 + (splitQuery.length * 5) + 15;

  // 3. Executive Summary Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('2.0 COMPLIANCE SUMMARY', 15, yPos);
  doc.line(15, yPos + 2, 30, yPos + 2);
  yPos += 10;

  doc.setFillColor(30, 41, 59);
  doc.rect(15, yPos, 180, 10, 'F');
  doc.setTextColor(255);
  doc.setFontSize(9);
  doc.text('SN', 20, yPos + 6.5);
  doc.text('IS CODE', 35, yPos + 6.5);
  doc.text('MATCH %', 85, yPos + 6.5);
  doc.text('AUDIT STATUS', 120, yPos + 6.5);
  doc.text('REGULATORY RISK', 160, yPos + 6.5);

  doc.setTextColor(30, 41, 59);
  yPos += 10;
  results.forEach((res, i) => {
    doc.setDrawColor(241, 245, 249);
    doc.line(15, yPos + 8, 195, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${i + 1}`, 20, yPos + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(res.code, 35, yPos + 5.5);
    doc.text(`${res.matchScore}%`, 85, yPos + 5.5);
    
    doc.setTextColor(16, 185, 129);
    doc.text('VERIFIED', 120, yPos + 5.5);
    
    const risk = res.risk_level || 'Medium';
    doc.setTextColor(risk === 'High' ? 239 : 245, risk === 'High' ? 68 : 158, risk === 'High' ? 68 : 11);
    doc.text(risk.toUpperCase(), 160, yPos + 5.5);
    
    doc.setTextColor(30, 41, 59);
    yPos += 10;
  });

  yPos += 10;

  // 4. Detailed Technical Annex
  doc.setFontSize(12);
  doc.text('3.0 TECHNICAL ANNEX: DETAILED AUDIT', 15, yPos);
  doc.setDrawColor(59, 130, 246);
  doc.line(15, yPos + 2, 30, yPos + 2);
  yPos += 12;

  results.forEach((res, index) => {
    // Dynamic Height Calculation
    const splitTitle = doc.splitTextToSize(`${res.code}: ${res.title}`, 160);
    const splitRationale = doc.splitTextToSize(res.rationale, 170);
    const splitAction = doc.splitTextToSize(res.compliance_action || 'N/A', 170);
    
    const headerHeight = 10 + (splitTitle.length * 5);
    const bodyHeight = 45 + (splitRationale.length * 5) + (splitAction.length * 5);
    const totalHeight = headerHeight + bodyHeight;

    if (yPos + totalHeight > 270) {
      doc.addPage();
      drawHeader(2);
      yPos = 45;
    }

    // Box Header
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, yPos, 180, headerHeight, 'F');
    doc.rect(15, yPos, 180, headerHeight, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(splitTitle, 20, yPos + 8);
    
    yPos += headerHeight;

    // Box Body
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, yPos, 180, bodyHeight, 'S');
    
    doc.setFontSize(8);
    doc.setTextColor(59, 130, 246);
    doc.text('TECHNICAL RATIONALE', 20, yPos + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(splitRationale, 20, yPos + 14);

    const actionY = yPos + 18 + (splitRationale.length * 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(245, 158, 11);
    doc.text('MANDATORY COMPLIANCE ACTION', 20, actionY);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(splitAction, 20, actionY + 6);

    const clausesY = actionY + 12 + (splitAction.length * 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('CRITICAL CLAUSES FOR VERIFICATION', 20, clausesY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const clauses = (res.critical_clauses || ['Clause 6', 'Table 5']);
    
    clauses.forEach((clause, ci) => {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, clausesY + 3 + (ci * 6), 170, 5, 'F');
        doc.text(`• ${clause}`, 23, clausesY + 6.5 + (ci * 6));
    });

    yPos += bodyHeight + 15;
  });

  // Footer on final page
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('NIRMARK REGULATORY ADVISORY • STRICTLY FOR TECHNICAL AUDIT PURPOSES • NOT A SUBSTITUTE FOR OFFICIAL GAZETTE VERIFICATION', 105, 285, { align: 'center' });

  doc.save(`NIRMARK_BIS_Audit_${reportId}.pdf`);
};
