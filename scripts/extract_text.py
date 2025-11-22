import PyPDF2; pdf = PyPDF2.PdfReader("sciadv.ads1560.pdf"); print(f"PDF总页数: {len(pdf.pages)}"); text = pdf.pages[0].extract_text(); print(text[:300] + "..." if len(text) > 300 else text)
