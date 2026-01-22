import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Report } from '@/lib/store/reports';

export class PDFExportService {
    private doc: jsPDF;
    private report: Report;
    private pageCount: number = 0;
    private toc: { title: string; page: number }[] = [];

    constructor(report: Report) {
        this.report = report;
        this.doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
    }

    private addFooter() {
        const totalPages = (this.doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            this.doc.setPage(i);
            this.doc.setFontSize(8);
            this.doc.setTextColor(100);
            this.doc.setFont('helvetica', 'normal');
            const pageWidth = this.doc.internal.pageSize.getWidth();
            const pageHeight = this.doc.internal.pageSize.getHeight();

            const text = `Narcotic Division — Report ${this.report.reportNumber} — Page ${i} / ${totalPages}`;
            this.doc.text(text, pageWidth / 2, pageHeight - 10, { align: 'center' });

            this.doc.setDrawColor(200);
            this.doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
        }
    }

    private async addCoverPage() {
        const pageWidth = this.doc.internal.pageSize.getWidth();

        // Header Logo/Text Placeholder
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 50, 0); // Dark Green
        this.doc.text("NARCOTIC DIVISION", pageWidth / 2, 40, { align: 'center' });

        this.doc.setFontSize(14);
        this.doc.setTextColor(80);
        this.doc.text("OFFICIAL FIELD INTELLIGENCE REPORT", pageWidth / 2, 50, { align: 'center' });

        // Divider
        this.doc.setDrawColor(0, 50, 0);
        this.doc.setLineWidth(1);
        this.doc.line(40, 60, pageWidth - 40, 60);

        // Report Info
        this.doc.setTextColor(0);
        this.doc.setFontSize(12);
        this.doc.text(`REPORT NUMBER:`, 40, 80);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(this.report.reportNumber, 100, 80);

        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`TITLE:`, 40, 90);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(this.report.title.toUpperCase(), 100, 90);

        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`AUTHOR:`, 40, 100);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(this.report.authorName, 100, 100);

        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`STATUS:`, 40, 110);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 100, 0);
        this.doc.text(this.report.status, 100, 110);

        this.doc.setTextColor(0);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`SUBMITTED:`, 40, 120);
        this.doc.text(this.report.submittedAt ? new Date(this.report.submittedAt).toLocaleString() : "N/A", 100, 120);

        if (this.report.approvedAt) {
            this.doc.text(`APPROVED:`, 40, 130);
            this.doc.text(new Date(this.report.approvedAt).toLocaleString(), 100, 130);
        }

        // Tactical Seal/Logo (Using a shapes/text)
        this.doc.setDrawColor(0, 50, 0);
        this.doc.setLineWidth(0.1);
        this.doc.circle(pageWidth / 2, 200, 30);
        this.doc.setFontSize(8);
        this.doc.text("FOR OFFICIAL USE ONLY", pageWidth / 2, 201, { align: 'center' });
    }

    private addTableOfContents() {
        this.doc.addPage();
        this.toc.push({ title: "Narrative Content", page: 3 });

        const pageWidth = this.doc.internal.pageSize.getWidth();
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text("TABLE OF CONTENTS", 20, 30);

        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');

        let y = 50;
        this.toc.forEach(item => {
            this.doc.text(item.title, 20, y);
            this.doc.text(item.page.toString(), pageWidth - 30, y, { align: 'right' });

            // Dotted line
            this.doc.setLineDashPattern([1, 1], 0);
            this.doc.line(70, y, pageWidth - 40, y);
            this.doc.setLineDashPattern([], 0);

            y += 10;
        });
    }

    private addReportBody() {
        this.doc.addPage();
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text("I. NARRATIVE CONTENT", 20, 30);

        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');

        // Simple HTML to Text for now, focusing on structure
        // Tiptap content is HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.report.content;
        const plainText = tempDiv.innerText || tempDiv.textContent || "";

        const lines = this.doc.splitTextToSize(plainText, 170);
        this.doc.text(lines, 20, 45);
    }

    private async addTacticalMap(mapElement: HTMLElement) {
        this.doc.addPage('a4', 'l'); // Landscape
        const pageIdx = (this.doc as any).internal.getNumberOfPages();
        this.toc.push({ title: "Tactical Intelligence Map", page: pageIdx });

        const pageWidth = this.doc.internal.pageSize.getWidth();
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text("II. TACTICAL INTELLIGENCE MAP", 20, 20);

        try {
            const canvas = await html2canvas(mapElement, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#0a0a0a'
            });
            const imgData = canvas.toDataURL('image/png');
            this.doc.addImage(imgData, 'PNG', 20, 30, pageWidth - 40, 130);
        } catch (e) {
            console.error("Map capture failed", e);
            this.doc.text("[MAP CAPTURE ERROR: SATELLITE FEED UNAVAILABLE]", 20, 50);
        }

        // Legend Below Map
        if (this.report.legend) {
            const legendEntries = Object.entries(this.report.legend).filter(([_, val]) => val);
            if (legendEntries.length > 0) {
                this.doc.setFontSize(12);
                this.doc.text("TACTICAL LEGEND", 20, 170);

                let lx = 20;
                let ly = 180;
                legendEntries.forEach(([color, label]) => {
                    // Color box
                    this.doc.setFillColor(color === 'white' ? '#ffffff' : color === 'yellow' ? '#ffff00' : color === 'red' ? '#ff0000' : color === 'blue' ? '#0000ff' : color === 'green' ? '#00ff00' : '#888888');
                    this.doc.rect(lx, ly - 4, 4, 4, 'F');
                    this.doc.setFontSize(10);
                    this.doc.setFont('helvetica', 'normal');
                    this.doc.text(label!, lx + 6, ly);

                    ly += 8;
                    if (ly > 195) { ly = 180; lx += 60; }
                });
            }
        }
    }

    private addEvidenceMetadata() {
        this.doc.addPage('a4', 'p'); // Back to Portrait
        const pageIdx = (this.doc as any).internal.getNumberOfPages();
        this.toc.push({ title: "Evidence Intelligence Locker", page: pageIdx });

        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text("III. EVIDENCE INTELLIGENCE LOCKER", 20, 30);

        const photoRows = (this.report.evidence?.photo || []).map((p, idx) => [
            `E${idx + 1}`,
            p.title,
            p.capturedBy.type === 'INTERNAL' ? (p.capturedBy.officerId || 'Unknown') : p.capturedBy.externalDetails?.fullName || 'External',
            new Date(p.timestamp).toLocaleString(),
            p.linkedMarkerIds?.join(', ') || 'None'
        ]);

        const videoRows = (this.report.evidence?.video || []).map((v, idx) => [
            `V${idx + 1}`,
            v.title,
            v.capturedBy.type === 'INTERNAL' ? (v.capturedBy.officerId || 'Unknown') : v.capturedBy.externalDetails?.fullName || 'External',
            new Date(v.timestamp).toLocaleString(),
            v.linkedMarkerIds?.join(', ') || 'None'
        ]);

        if (photoRows.length > 0) {
            this.doc.setFontSize(12);
            this.doc.text("PHOTOGRAPHIC ASSETS", 20, 45);
            autoTable(this.doc, {
                startY: 50,
                head: [['ID', 'Title', 'Captured By', 'Timestamp', 'Linked Items']],
                body: photoRows,
                theme: 'grid',
                headStyles: { fillColor: [0, 50, 0] },
                styles: { fontSize: 9 }
            });
        }

        const nextY = (this.doc as any).lastAutoTable?.finalY + 15 || 60;

        if (videoRows.length > 0) {
            this.doc.setFontSize(12);
            this.doc.text("VIDEO ASSETS", 20, nextY);
            autoTable(this.doc, {
                startY: nextY + 5,
                head: [['ID', 'Title', 'Source/Officer', 'Timestamp', 'Linked Items']],
                body: videoRows,
                theme: 'grid',
                headStyles: { fillColor: [0, 50, 0] },
                styles: { fontSize: 9 }
            });
        }
    }

    private async addPhotoAttachments() {
        if (!this.report.evidence?.photo) return;

        for (let i = 0; i < this.report.evidence.photo.length; i++) {
            const photo = this.report.evidence.photo[i];
            this.doc.addPage('a4', 'l');
            const pageIdx = (this.doc as any).internal.getNumberOfPages();
            if (i === 0) this.toc.push({ title: "Photo Attachments", page: pageIdx });

            this.doc.setFontSize(14);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`ATTACHMENT E${i + 1}: ${photo.title.toUpperCase()}`, 20, 20);

            try {
                // We attempt to add image. If it's a remote URL, this might need a proxy or base64
                // for this implementation we assume URLs are accessible or transformed
                this.doc.addImage(photo.fileUrl, 'JPEG', 20, 30, 250, 140, undefined, 'FAST');
            } catch (e) {
                this.doc.setTextColor(255, 0, 0);
                this.doc.text("[IMAGE DATA ERROR — CORRUPTED OR UNREACHABLE]", 20, 50);
                this.doc.setTextColor(0);
            }

            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'italic');
            const author = photo.capturedBy.type === 'INTERNAL' ? photo.capturedBy.officerId : photo.capturedBy.externalDetails?.fullName;
            this.doc.text(`Evidence #E${i + 1} — ${photo.title} — Captured by ${author} — ${new Date(photo.timestamp).toLocaleString()}`, 20, 185);
        }
    }

    private addSignOff() {
        this.doc.addPage('a4', 'p');
        const pageIdx = (this.doc as any).internal.getNumberOfPages();
        this.toc.push({ title: "Official Sign-Off", page: pageIdx });

        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text("IV. OFFICIAL SIGN-OFF", 20, 30);

        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');

        this.doc.text("SUBMITTED BY:", 20, 60);
        this.doc.line(60, 60, 150, 60);
        this.doc.setFontSize(9);
        this.doc.text(this.report.authorName, 60, 65);

        this.doc.setFontSize(12);
        this.doc.text("APPROVED BY:", 20, 80);
        this.doc.line(60, 80, 150, 80);
        this.doc.setFontSize(9);
        this.doc.text("MODERATOR / COMMAND STAFF", 60, 85);

        this.doc.setFontSize(10);
        this.doc.text("Los Santos Police Department", 20, 120);
        this.doc.text("Narcotic Division — Intelligence & Operations", 20, 125);
        this.doc.text(`${new Date().toLocaleString()}`, 20, 130);
    }

    public async generate(mapElement?: HTMLElement) {
        await this.addCoverPage();

        // Narrative page exists at index 3
        this.addReportBody();

        if (mapElement) {
            await this.addTacticalMap(mapElement);
        }

        this.addEvidenceMetadata();
        await this.addPhotoAttachments();
        this.addSignOff();

        // TOC needs to be added LAST but moved to page 2 (we skip it for now or insert)
        // Actually, jsPDF allows movePage or just adding it where intended.
        // For simplicity, we planned it as page 2, so we'll just add it to TOC list during build.

        this.addFooter();

        this.doc.save(`ND-REPORT-${this.report.reportNumber}.pdf`);
    }
}
