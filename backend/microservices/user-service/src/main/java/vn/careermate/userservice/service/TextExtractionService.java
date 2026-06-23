package vn.careermate.userservice.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.io.RandomAccessReadBufferedFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Service for extracting text content from PDF and DOCX files
 * Uses Apache PDFBox for PDF and Apache POI for DOCX
 */
@Slf4j
@Service
public class TextExtractionService {

    private static final int MAX_TEXT_LENGTH = 50000; // Limit to 50,000 characters

    /**
     * Extract text from a file based on its type
     * @param file The file to extract text from
     * @param fileType The MIME type or file extension (e.g., "application/pdf", "pdf")
     * @return Extracted text, or empty string if extraction fails
     */
    public String extractTextFromFile(File file, String fileType) {
        if (file == null || !file.exists()) {
            log.warn("File does not exist or is null");
            return "";
        }

        try {
            String normalizedType = normalizeFileType(fileType);
            log.info("TextExtractionService - Extracting from file: {}. Type: {}. Normalized: {}", 
                file.getName(), fileType, normalizedType);
            
            if (normalizedType.contains("pdf")) {
                return extractTextFromPdf(file);
            } else if (normalizedType.contains("docx") || normalizedType.contains("wordprocessingml")) {
                return extractTextFromDocx(file);
            } else {
                log.warn("TextExtractionService - Unsupported file type: {}", fileType);
                return "";
            }
        } catch (Exception e) {
            log.error("Error extracting text from file: {}", file.getName(), e);
            return "";
        }
    }

    /**
     * Extract text from PDF file using Apache PDFBox
     */
    private String extractTextFromPdf(File file) {
        log.info("TextExtractionService - Loading PDF file: {}", file.getAbsolutePath());
        try (PDDocument document = Loader.loadPDF(new RandomAccessReadBufferedFile(file))) {
            if (document.isEncrypted()) {
                log.warn("TextExtractionService - PDF is encrypted and cannot be read without a password");
            }
            log.info("TextExtractionService - PDF loaded. Pages: {}. Version: {}", 
                document.getNumberOfPages(), document.getVersion());
            
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            
            String text = stripper.getText(document);
            log.info("TextExtractionService - Raw text length: {}", text != null ? text.length() : "null");
            
            if (text == null || text.trim().isEmpty()) {
                log.warn("TextExtractionService - Extraction returned empty text. Trying page by page...");
                StringBuilder sb = new StringBuilder();
                for (int i = 1; i <= document.getNumberOfPages(); i++) {
                    stripper.setStartPage(i);
                    stripper.setEndPage(i);
                    String pageText = stripper.getText(document);
                    log.info("TextExtractionService - Page {} text length: {}", i, pageText != null ? pageText.length() : "null");
                    if (pageText != null) sb.append(pageText);
                }
                text = sb.toString();
            }
            
            if (text != null && text.length() > MAX_TEXT_LENGTH) {
                log.info("PDF text truncated from {} to {} characters", text.length(), MAX_TEXT_LENGTH);
                text = text.substring(0, MAX_TEXT_LENGTH) + "\n... (truncated)";
            }
            
            log.info("Successfully extracted {} characters from PDF: {}", 
                text != null ? text.length() : 0, file.getName());
            return text != null ? text.trim() : "";
            
        } catch (IOException e) {
            log.error("Error extracting text from PDF: {}", file.getName(), e);
            return "";
        }
    }

    /**
     * Extract text from DOCX file using Apache POI
     */
    private String extractTextFromDocx(File file) {
        try (FileInputStream fis = new FileInputStream(file);
             XWPFDocument document = new XWPFDocument(fis);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            
            String text = extractor.getText();
            
            if (text != null && text.length() > MAX_TEXT_LENGTH) {
                log.info("DOCX text truncated from {} to {} characters", text.length(), MAX_TEXT_LENGTH);
                text = text.substring(0, MAX_TEXT_LENGTH) + "\n... (truncated)";
            }
            
            log.info("Successfully extracted {} characters from DOCX: {}", 
                text != null ? text.length() : 0, file.getName());
            return text != null ? text.trim() : "";
            
        } catch (IOException e) {
            log.error("Error extracting text from DOCX: {}", file.getName(), e);
            return "";
        }
    }

    /**
     * Normalize file type string for comparison
     */
    private String normalizeFileType(String fileType) {
        if (fileType == null) {
            return "";
        }
        return fileType.toLowerCase().trim();
    }

    /**
     * Extract text from InputStream (alternative method)
     */
    public String extractTextFromPdfStream(InputStream inputStream) {
        try (PDDocument document = Loader.loadPDF(new RandomAccessReadBuffer(inputStream))) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            
            if (text != null && text.length() > MAX_TEXT_LENGTH) {
                log.info("PDF stream text truncated from {} to {} characters", text.length(), MAX_TEXT_LENGTH);
                text = text.substring(0, MAX_TEXT_LENGTH) + "\n... (truncated)";
            }
            
            return text != null ? text.trim() : "";
            
        } catch (IOException e) {
            log.error("Error extracting text from PDF stream", e);
            return "";
        }
    }

    /**
     * Extract text from DOCX InputStream (alternative method)
     */
    public String extractTextFromDocxStream(InputStream inputStream) {
        try (XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            
            String text = extractor.getText();
            
            if (text != null && text.length() > MAX_TEXT_LENGTH) {
                log.info("DOCX stream text truncated from {} to {} characters", text.length(), MAX_TEXT_LENGTH);
                text = text.substring(0, MAX_TEXT_LENGTH) + "\n... (truncated)";
            }
            
            return text != null ? text.trim() : "";
            
        } catch (IOException e) {
            log.error("Error extracting text from DOCX stream", e);
            return "";
        }
    }
}
