import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker - using unpkg CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ParsedResumeData {
  text: string;
  name: string;
  email: string;
  phone: string;
}

export const parsePDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

export const parseDOCX = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

export const extractContactInfo = (text: string): { name: string; email: string; phone: string } => {
  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract phone (various formats)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Extract name - simply take the first word from the resume
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  let name = '';

  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Get the first word (split by space and take first element)
    const words = firstLine.split(/\s+/);
    if (words.length > 0) {
      name = words[0];
    }
  }

  return { name, email, phone };
};

export const parseResume = async (file: File): Promise<ParsedResumeData> => {
  let text = '';

  if (file.type === 'application/pdf') {
    text = await parsePDF(file);
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    text = await parseDOCX(file);
  } else {
    throw new Error('Unsupported file format. Please upload PDF or DOCX.');
  }

  const { name, email, phone } = extractContactInfo(text);

  return { text, name, email, phone };
};
