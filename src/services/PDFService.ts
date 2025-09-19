import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { InterviewSession } from '../store/slices/historySlice';

interface PDFExportOptions {
  includeTranscript?: boolean;
  includeFeedback?: boolean;
  includeChart?: boolean;
  format?: 'detailed' | 'summary';
}

class PDFService {
  private static instance: PDFService;

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  public async generateSessionReport(
    session: InterviewSession,
    options: PDFExportOptions = {}
  ): Promise<string | null> {
    try {
      const {
        includeTranscript = true,
        includeFeedback = true,
        format = 'detailed'
      } = options;

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const html = this.generateHTML(session, {
        includeTranscript,
        includeFeedback,
        format
      });

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Move to a more permanent location
      const fileName = `interview_${session.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: permanentUri,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return permanentUri;

    } catch (error) {
      console.error('Error generating PDF:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return null;
    }
  }

  public async shareSessionReport(
    session: InterviewSession,
    options: PDFExportOptions = {}
  ): Promise<boolean> {
    try {
      const pdfUri = await this.generateSessionReport(session, options);
      if (!pdfUri) return false;

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.log('Sharing is not available on this device');
        return false;
      }

      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Interview Report',
      });

      return true;
    } catch (error) {
      console.error('Error sharing PDF:', error);
      return false;
    }
  }

  private generateHTML(session: InterviewSession, options: PDFExportOptions): string {
    const { includeTranscript, includeFeedback, format } = options;
    const date = new Date(session.createdAt).toLocaleDateString();
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Interview Report - ${session.title}</title>
        <style>
            ${this.getCSS()}
        </style>
    </head>
    <body>
        <div class="container">
            ${this.generateHeader(session, date)}
            ${this.generateScoreSection(session)}
            ${includeFeedback ? this.generateFeedbackSection(session) : ''}
            ${includeTranscript && format === 'detailed' ? this.generateTranscriptSection(session) : ''}
            ${this.generateFooter()}
        </div>
    </body>
    </html>
    `;
  }

  private getCSS(): string {
    return `
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background: #ffffff;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        
        .logo {
            color: #3b82f6;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #1e293b;
            margin: 20px 0 10px 0;
        }
        
        .subtitle {
            color: #64748b;
            font-size: 16px;
        }
        
        .score-section {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
        }
        
        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 60px;
            background: #3b82f6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px auto;
            font-size: 36px;
            font-weight: bold;
        }
        
        .score-label {
            font-size: 18px;
            color: #475569;
            margin-bottom: 10px;
        }
        
        .performance-level {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 10px;
        }
        
        .excellent { background: #dcfce7; color: #166534; }
        .good { background: #dbeafe; color: #1d4ed8; }
        .fair { background: #fef3c7; color: #92400e; }
        .needs-improvement { background: #fee2e2; color: #dc2626; }
        
        .section {
            margin: 40px 0;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .feedback-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        
        .feedback-card {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #3b82f6;
        }
        
        .feedback-card.strengths {
            border-left-color: #10b981;
        }
        
        .feedback-card.improvements {
            border-left-color: #f59e0b;
        }
        
        .feedback-card.learnings {
            border-left-color: #8b5cf6;
        }
        
        .feedback-card h4 {
            margin: 0 0 15px 0;
            font-size: 16px;
            font-weight: 600;
        }
        
        .feedback-card ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .feedback-card li {
            margin-bottom: 8px;
            color: #475569;
        }
        
        .transcript {
            background: #f1f5f9;
            border-radius: 8px;
            padding: 20px;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.8;
            white-space: pre-wrap;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .user-message {
            color: #1e40af;
            font-weight: 500;
        }
        
        .ai-message {
            color: #059669;
            font-weight: 500;
        }
        
        .footer {
            text-align: center;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 20px 0;
        }
        
        .stat-card {
            text-align: center;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        @media print {
            .container {
                padding: 20px;
            }
            
            .feedback-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
  }

  private generateHeader(session: InterviewSession, date: string): string {
    return `
        <div class="header">
            <div class="logo">InterviewCoach AI</div>
            <div class="title">${session.title}</div>
            <div class="subtitle">
                ${session.role} • ${date} • ${Math.floor(session.duration / 60)}min ${session.duration % 60}s
            </div>
        </div>
    `;
  }

  private generateScoreSection(session: InterviewSession): string {
    const performanceLevel = this.getPerformanceLevel(session.score);
    
    return `
        <div class="score-section">
            <div class="score-circle">${session.score.toFixed(1)}</div>
            <div class="score-label">Overall Score</div>
            <div class="performance-level ${performanceLevel.class}">
                ${performanceLevel.label}
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${Math.floor(session.duration / 60)}</div>
                    <div class="stat-label">Minutes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${session.role}</div>
                    <div class="stat-label">Position</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${session.transcript.split('\\n').filter(line => line.startsWith('User:')).length}</div>
                    <div class="stat-label">Responses</div>
                </div>
            </div>
        </div>
    `;
  }

  private generateFeedbackSection(session: InterviewSession): string {
    return `
        <div class="section">
            <div class="section-title">Detailed Feedback</div>
            <div class="feedback-grid">
                <div class="feedback-card strengths">
                    <h4>💪 Strengths</h4>
                    <ul>
                        ${session.strengths.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="feedback-card improvements">
                    <h4>🎯 Areas for Improvement</h4>
                    <ul>
                        ${session.improvements.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="feedback-card learnings">
                    <h4>📚 Key Learnings</h4>
                    <ul>
                        ${session.learnings.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
  }

  private generateTranscriptSection(session: InterviewSession): string {
    // Format transcript for better readability
    const formattedTranscript = session.transcript
      .split('\\n')
      .map(line => {
        if (line.startsWith('User:')) {
          return `<span class="user-message">${line}</span>`;
        } else if (line.startsWith('AI:')) {
          return `<span class="ai-message">${line}</span>`;
        }
        return line;
      })
      .join('\\n');

    return `
        <div class="section">
            <div class="section-title">Interview Transcript</div>
            <div class="transcript">${formattedTranscript}</div>
        </div>
    `;
  }

  private generateFooter(): string {
    const date = new Date().toLocaleDateString();
    return `
        <div class="footer">
            <p>Generated by InterviewCoach AI on ${date}</p>
            <p>This report is confidential and intended for personal development purposes.</p>
        </div>
    `;
  }

  private getPerformanceLevel(score: number): { label: string; class: string } {
    if (score >= 8.5) return { label: 'Excellent Performance', class: 'excellent' };
    if (score >= 7.0) return { label: 'Good Performance', class: 'good' };
    if (score >= 5.5) return { label: 'Fair Performance', class: 'fair' };
    return { label: 'Needs Improvement', class: 'needs-improvement' };
  }

  public async listGeneratedReports(): Promise<string[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!);
      return files.filter(file => file.startsWith('interview_') && file.endsWith('.pdf'));
    } catch (error) {
      console.error('Error listing PDF reports:', error);
      return [];
    }
  }

  public async deleteReport(fileName: string): Promise<boolean> {
    try {
      const uri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.deleteAsync(uri);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return true;
    } catch (error) {
      console.error('Error deleting PDF report:', error);
      return false;
    }
  }
}

export default PDFService;
