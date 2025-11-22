import PyPDF2
import re

pdf = PyPDF2.PdfReader("sciadv.ads1560.pdf")
print(f"PDF共有{len(pdf.pages)}页\n")

for i in range(len(pdf.pages)):
    text = pdf.pages[i].extract_text()
    
    # 查找包含Fig.或Figure的段落
    if "Fig." in text or "Figure" in text:
        print(f"===== 页面 {i+1} 包含图表 =====")
        
        # 尝试提取图表标题和描述
        # 尝试匹配Fig开头的文本
        fig_matches = re.findall(r'Fig\.\s*\d+[^\.]+\.', text)
        figure_matches = re.findall(r'Figure\s*\d+[^\.]+\.', text)
        
        # 打印匹配结果
        if fig_matches or figure_matches:
            print("找到图表描述:")
            for match in fig_matches + figure_matches:
                print(f"- {match.strip()}")
        
        # 提取与年龄和技能相关的上下文
        age_skill_context = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['age', 'skill', 'cognitive', 'literacy', 'numeracy', 'use it or lose it']):
                age_skill_context.append(line)
        
        if age_skill_context:
            print("\n年龄与技能相关上下文:")
            for ctx in age_skill_context[:5]:  # 只打印前5个匹配项
                print(f"- {ctx.strip()}")
        
        print("\n")
