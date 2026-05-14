import re

with open("session_grabber.py", "r", encoding="utf-8") as f:
    content = f.read()

# Make sure we have extraFields
if "const extraFields =" not in content:
    fix = """                // Keywords: Site logic shifts search_text to search_txt1
                aoData.push({ "name": "search_txt1", "value": params.keyword });
                aoData.push({ "name": "search_txt2", "value": "" });
                aoData.push({ "name": "search_txt3", "value": "" });
                aoData.push({ "name": "search_txt4", "value": "" });
                aoData.push({ "name": "search_txt5", "value": "" });

                // ALL parameters from get_details_searchclick to ensure zero rejection
                const extraFields = [
                    "case_no", "case_year", "reg_year", "judge_name", "fulltext_case_type",
                    "int_fin_party_val", "int_fin_case_val", "int_fin_court_val", "int_fin_decision_val",
                    "citation_yr", "citation_vol", "citation_supl", "citation_page",
                    "act", "sel_search_by", "sections", "judge_txt", "act_txt", "section_txt",
                    "judge_val", "act_val", "year_val", "judge_arr", "disp_nature",
                    "case_no1", "case_year1", "pet_res1", "fulltext_case_type1",
                    "citation_keyword", "proximity", "neu_cit_year", "neu_no", "pet_res"
                ];
                extraFields.forEach(f => aoData.push({ "name": f, "value": "" }));"""
    
    content = re.sub(r'// Keywords:.*?"value": "" \}\);', fix, content, flags=re.DOTALL)

with open("session_grabber.py", "w", encoding="utf-8") as f:
    f.write(content)
