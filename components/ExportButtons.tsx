import React from 'react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import saveAs from 'file-saver'; // Changed from { saveAs }
import { useGlobalContext } from '../contexts/GlobalContext';
import { PersonalityReport } from '../types';
import { APP_TITLE } from '../constants'; // Import APP_TITLE

const ExportButtons: React.FC = () => {
  const { personalityReport, chatHistory, userName, translate, setError } = useGlobalContext();

  const generatePdfSummary = () => {
    if (!personalityReport) {
        setError(translate('exportError') + " No report data.");
        return;
    }
    try {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`${userName}'s Personality Summary`, 14, 22);
        doc.setFontSize(12);
        let yPos = 30;

        const addSection = (title: string, content?: string | string[]) => {
            if (yPos > 270) { doc.addPage(); yPos = 20; } // Basic pagination
            if (content) {
                doc.setFontSize(14);
                doc.setTextColor(0, 165, 233); // Accent color
                doc.text(title, 14, yPos);
                yPos += 7;
                doc.setFontSize(10);
                doc.setTextColor(50,50,50); // Darker text for content
                if (Array.isArray(content)) {
                    content.forEach(item => {
                        const lines = doc.splitTextToSize(item, 180);
                        doc.text(lines, 14, yPos);
                        yPos += (lines.length * 4) + 2;
                    });
                } else {
                    const lines = doc.splitTextToSize(content, 180);
                    doc.text(lines, 14, yPos);
                    yPos += (lines.length * 4) + 2;
                }
                yPos += 5; // Space after section
            }
        };
        
        addSection(translate('reportSection_summary'), personalityReport.summary);
        addSection(translate('reportSection_mbti'), personalityReport.mbti);
        addSection(translate('reportSection_strengths'), personalityReport.strengths);
        addSection(translate('reportSection_weaknesses'), personalityReport.weaknesses);
        addSection(translate('reportSection_suggestedCareerPaths'), personalityReport.suggestedCareerPaths);
        addSection(translate('reportSection_motivationalQuote'), personalityReport.motivationalQuote);

        doc.save(`${userName}_Personality_Summary.pdf`);
    } catch (e) {
        console.error("PDF Export Error:", e);
        setError(translate('exportError') + (e as Error).message);
    }
  };

  const exportFullScriptDocx = async () => {
    if (chatHistory.length === 0) {
        setError(translate('exportError') + " No chat history.");
        return;
    }
    try {
        const formatMessage = (msg: typeof chatHistory[0]) => {
            const prefix = msg.sender === 'user' ? `${userName || 'User'}:` : `${APP_TITLE}:`; // Use APP_TITLE
            return new Paragraph({
                children: [
                    new TextRun({ text: prefix, bold: true, color: msg.sender === 'user' ? "0EA5E9" : "F59E0B" }), // Accent for user, Highlight for AI
                    new TextRun({ text: ` ${msg.text}`, break: (prefix.length + msg.text.length > 80 ? 1 : 0) }) // Basic line break logic
                ],
                spacing: { after: 200 }
            });
        };

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: `${userName || 'User'}'s ${APP_TITLE} Session`, size: 36, bold: true, color: "1E293B" })], // Use APP_TITLE
                        spacing: { after: 400 }
                    }),
                    ...chatHistory.map(formatMessage)
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${userName}_Full_Script.docx`);
    } catch (e) {
        console.error("DOCX Export Error:", e);
        setError(translate('exportError') + (e as Error).message);
    }
  };

  const exportKeyNotesTxt = () => {
    if (!personalityReport) {
        setError(translate('exportError') + " No report data.");
        return;
    }
    try {
        let notes = `${userName}'s Key Personality Notes (${APP_TITLE})\n\n`; // Added APP_TITLE
        const addNote = (title: string, content?: string | string[]) => {
            if(content){
                notes += `--- ${title.toUpperCase()} ---\n`;
                if (Array.isArray(content)) {
                    notes += content.map(item => `- ${item}`).join('\n') + '\n'; 
                } else {
                    notes += content + '\n';
                }
                notes += '\n';
            }
        };

        addNote(translate('reportSection_summary'), personalityReport.summary);
        addNote(translate('reportSection_mbti'), personalityReport.mbti);
        addNote(translate('reportSection_strengths'), personalityReport.strengths);
        addNote(translate('reportSection_weaknesses'), personalityReport.weaknesses);
        addNote(translate('reportSection_suggestionsForImprovement'), personalityReport.suggestionsForImprovement);
        addNote(translate('reportSection_motivationalQuote'), personalityReport.motivationalQuote);

        const blob = new Blob([notes], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${userName}_Key_Notes.txt`);
    } catch (e) {
        console.error("TXT Export Error:", e);
        setError(translate('exportError') + (e as Error).message);
    }
  };

  const buttonClass = "bg-accent hover:bg-highlight text-darkText font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm md:text-base";

  return (
    <div className="mt-8 p-6 bg-primary rounded-lg shadow-inner animate-slide-in-up" style={{animationDelay: '0.5s'}}>
      <h4 className="text-lg font-semibold text-lightText mb-4 text-center">{translate('exportOptionsTitle', {defaultValue: 'Export Your Report'})}</h4>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button onClick={generatePdfSummary} className={buttonClass} aria-label={translate('downloadSummaryPdf')}>
          <i className="fas fa-file-pdf mr-2" aria-hidden="true"></i>{translate('downloadSummaryPdf')}
        </button>
        <button onClick={exportFullScriptDocx} className={buttonClass} aria-label={translate('exportFullScriptDocx')}>
          <i className="fas fa-file-word mr-2" aria-hidden="true"></i>{translate('exportFullScriptDocx')}
        </button>
        <button onClick={exportKeyNotesTxt} className={buttonClass} aria-label={translate('exportKeyNotesTxt')}>
          <i className="fas fa-file-alt mr-2" aria-hidden="true"></i>{translate('exportKeyNotesTxt')}
        </button>
      </div>
    </div>
  );
};

export default ExportButtons;
