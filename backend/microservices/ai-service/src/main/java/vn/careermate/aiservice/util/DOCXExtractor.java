package vn.careermate.aiservice.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

@Slf4j
public class DOCXExtractor {

    public static String extractText(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(filePath);
             XWPFDocument document = new XWPFDocument(fis)) {
            
            StringBuilder text = new StringBuilder();
            List<XWPFParagraph> paragraphs = document.getParagraphs();
            
            for (XWPFParagraph paragraph : paragraphs) {
                text.append(paragraph.getText()).append("\n");
            }
            
            return text.toString();
        } catch (IOException e) {
            log.error("Error extracting text from DOCX: {}", filePath, e);
            throw e;
        }
    }
}
