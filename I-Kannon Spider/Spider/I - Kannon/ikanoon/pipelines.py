import os
import re
from fpdf import FPDF
from ikanoon.settings import PDF_DIR

class MarkdownAndPDFPipeline:
    def process_item(self, item, spider):
        self.create_pdf(item, spider)
        return item

    def create_pdf(self, item, spider):
        try:
            pdf = FPDF()
            pdf.add_page()
            
            # Use basic fonts
            pdf.set_font("Helvetica", style="B", size=16)
            
            case_title = item.get('case_title', 'Unknown Title')
            
            # The title might have characters that FPDF doesn't like in latin-1 default,
            # so we encode to latin-1 encoding or replace characters
            case_title = case_title.encode('latin-1', 'replace').decode('latin-1')
            
            pdf.multi_cell(0, 10, case_title, align="C")
            pdf.ln(5)
            
            pdf.set_font("Helvetica", style="I", size=12)
            url_text = f"URL: {item.get('doc_url', '')}"
            pdf.multi_cell(0, 8, url_text, align="C")
            pdf.ln(10)
            
            pdf.set_font("Helvetica", size=12)
            text_content = item.get('judgment_text', '')
            
            # Split into paragraphs
            paragraphs = text_content.split('\n\n')
            
            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue
                # Ensure compatibility with basic FPDF text
                para = para.encode('latin-1', 'replace').decode('latin-1')
                pdf.multi_cell(0, 8, para)
                pdf.ln(4)
                
            safe_title = re.sub(r'[^a-zA-Z0-9_\-]', '_', case_title)[:80]
            case_id_safe = item.get('case_id', 'unknown')
            pdf_filename = f"{case_id_safe}_{safe_title}.pdf"
            year = item.get('year', 'misc')
            court = item.get('court', 'misc')
            year_dir = os.path.join(PDF_DIR, str(court), str(year))
            os.makedirs(year_dir, exist_ok=True)
            pdf_path = os.path.join(year_dir, pdf_filename)
            
            pdf.output(pdf_path)
            spider.logger.info(f"Saved PDF to {pdf_path}")
            
        except Exception as e:
            spider.logger.error(f"Failed to generate PDF for case {item.get('case_id')}: {str(e)}")
