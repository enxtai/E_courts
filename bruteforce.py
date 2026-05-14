import requests
import json

def test():
    app_token = "13f7337326baa8697b000ad51980d3415e2698ff799f3f95aff9112051fe2ca0"
    
    date_vals = ["CUSTOM", "Between", "4", "Range", "BETWEEN", "custom"]
    date_formats = [("01-01-2024", "31-01-2024"), ("2024-01-01", "2024-01-31"), ("01/01/2024", "31/01/2024")]
    
    for d_val in date_vals:
        for f_start, f_end in date_formats:
            print(f"Trying date_val={d_val}, from={f_start}, to={f_end}")
            
            aoData = [
                {"name": "sEcho", "value": "1"},
                {"name": "iColumns", "value": "3"},
                {"name": "iDisplayStart", "value": 0},
                {"name": "iDisplayLength", "value": 10},
                {"name": "mDataProp_0", "value": 0},
                {"name": "mDataProp_1", "value": 1},
                {"name": "mDataProp_2", "value": 2},
                {"name": "state_code", "value": "9~13"},
                {"name": "dist_code", "value": ""},
                {"name": "from_date", "value": f_start},
                {"name": "to_date", "value": f_end},
                {"name": "date_val", "value": d_val},
                {"name": "search_opt", "value": "PHRASE"},
                {"name": "fcourt_type", "value": "2"},
                {"name": "state_code_li", "value": "9"},
                {"name": "sel_lang", "value": ""},
                {"name": "app_token", "value": app_token},
                {"name": "flag", "value": ""},
                {"name": "search_txt1", "value": ""},
                {"name": "search_txt2", "value": ""},
                {"name": "search_txt3", "value": ""},
                {"name": "search_txt4", "value": ""},
                {"name": "search_txt5", "value": ""}
            ]
            
            extraFields = [
                "case_no", "case_year", "reg_year", "judge_name", "fulltext_case_type",
                "int_fin_party_val", "int_fin_case_val", "int_fin_court_val", "int_fin_decision_val",
                "citation_yr", "citation_vol", "citation_supl", "citation_page",
                "act", "sel_search_by", "sections", "judge_txt", "act_txt", "section_txt",
                "judge_val", "act_val", "year_val", "judge_arr", "disp_nature",
                "case_no1", "case_year1", "pet_res1", "fulltext_case_type1",
                "citation_keyword", "proximity", "neu_cit_year", "neu_no", "pet_res"
            ]
            
            for f in extraFields:
                aoData.append({"name": f, "value": ""})
                
            import urllib.parse
            postdata = "&".join([f"{v['name']}={urllib.parse.quote_plus(str(v['value']))}" for v in aoData])
            
            res = requests.post(
                "https://judgments.ecourts.gov.in/pdfsearch/index.php?p=pdf_search/home/Y",
                headers={
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "Cookie": "PHPSESSID=e33g1p14j6v9q8gq8gq8gq8gq8" # Need a valid PHPSESSID, wait this won't work
                },
                data=postdata
            )
            
            # Actually I can't easily do this without the valid PHPSESSID cookie from the Playwright session!
