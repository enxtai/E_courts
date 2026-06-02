import scrapy
from scrapy_playwright.page import PageMethod
import json
import base64
import os
import re
from io import BytesIO

# Try to import Audio processing libraries for Whisper
try:
    import torch
    import soundfile as sf
    import librosa
    from transformers import WhisperProcessor, WhisperForConditionalGeneration
    HAS_WHISPER = True
except (ImportError, OSError) as e:
    print(f"Failed to load Whisper dependencies: {e}")
    HAS_WHISPER = False

import json

class EcourtSpider(scrapy.Spider):
    name = 'ecourt'
    start_urls = ['https://services.ecourts.gov.in/ecourtindia_v6/?p=courtorder/index&app_token=#']

    custom_settings = {
        'DOWNLOAD_HANDLERS': {
            'http': 'scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler',
            'https': 'scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler',
        },
        'TWISTED_REACTOR': 'twisted.internet.asyncioreactor.AsyncioSelectorReactor',
        'PLAYWRIGHT_BROWSER_TYPE': 'chromium',
        'PLAYWRIGHT_LAUNCH_OPTIONS': {
            'headless': False,
        },
        'PLAYWRIGHT_DEFAULT_NAVIGATION_TIMEOUT': 120000,
        'ROBOTSTXT_OBEY': False
    }

    def __init__(self, from_date="01-01-2023", to_date="31-12-2023", state_code=None, dist_code=None, resume=False, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.from_date = from_date
        self.to_date = to_date
        self.state_code = state_code
        self.dist_code = dist_code
        self.resume = str(resume).lower() == "true"
        self.progress_file = "D:/ETL/ecourts/progress.json"
        self.processed_keys = set()
        
        if self.resume and os.path.exists(self.progress_file):
            try:
                with open(self.progress_file, 'r') as f:
                    data = json.load(f)
                    self.processed_keys = set(data.get("completed", []))
                self.logger.info(f"Resume enabled. Loaded {len(self.processed_keys)} completed items.")
            except Exception as e:
                self.logger.error(f"Error loading progress file: {e}")

        if HAS_WHISPER:
            self.processor = WhisperProcessor.from_pretrained("openai/whisper-small.en")
            self.model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small.en")

    def save_progress(self, key):
        self.processed_keys.add(key)
        try:
            os.makedirs(os.path.dirname(self.progress_file), exist_ok=True)
            with open(self.progress_file, 'w') as f:
                json.dump({"completed": list(self.processed_keys)}, f)
        except Exception as e:
            self.logger.error(f"Error saving progress: {e}")

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url,
                meta={
                    'playwright': True,
                    'playwright_include_page': True,
                },
                callback=self.parse
            )

    async def parse(self, response):
        page = response.meta['playwright_page']
        
        async def handle_dialog(dialog):
            self.logger.info(f"Dialog message: {dialog.message}")
            await dialog.accept()
            
        page.on("dialog", handle_dialog)
        
        # Fetch all available states from the DOM
        all_states = await page.evaluate('''() => {
            const select = document.getElementById("sess_state_code");
            return Array.from(select.options)
                .filter(opt => opt.value && opt.value !== "0")
                .map(opt => ({ value: opt.value, text: opt.text }));
        }''')
        
        # Filter if a specific state_code was provided, otherwise process all states
        if self.state_code:
            # Strip leading zeros for comparison since DOM values might be "1" and user passes "01"
            clean_target = self.state_code.lstrip('0')
            states = [s for s in all_states if s['value'].lstrip('0') == clean_target]
            self.logger.info(f"Targeting specific state code: {self.state_code}. Found {len(states)} matching state(s).")
        else:
            states = all_states
            self.logger.info(f"No specific state_code provided. Processing ALL {len(states)} states.")

        for state in states:
            self.logger.info(f"Processing State: {state['text']} ({state['value']})...")
            # Clear dependent dropdowns before triggering AJAX to prevent race conditions
            await page.evaluate(f'''() => {{
                document.getElementById("sess_dist_code").options.length = 1;
                document.getElementById("court_complex_code").options.length = 1;
                document.getElementById("sess_state_code").value = "{state["value"]}"; 
                fillDistrict("{state["value"]}");
            }}''')
            
            # Wait for districts to load
            try:
                await page.wait_for_function('document.getElementById("sess_dist_code").options.length > 1', timeout=15000)
            except Exception:
                self.logger.warning(f"Timeout waiting for districts in state {state['text']}. Skipping.")
                continue
            
            # Fetch all available districts for this state from the DOM
            all_districts = await page.evaluate('''() => {
                const select = document.getElementById("sess_dist_code");
                return Array.from(select.options)
                    .filter(opt => opt.value && opt.value !== "0")
                    .map(opt => ({ value: opt.value, text: opt.text }));
            }''')

            # Filter if a specific dist_code was provided, otherwise process all districts
            if self.dist_code:
                clean_target_dist = self.dist_code.lstrip('0')
                districts = [d for d in all_districts if d['value'].lstrip('0') == clean_target_dist]
            else:
                districts = all_districts

            for dist in districts:
                self.logger.info(f"  Processing District: {dist['text']} ({dist['value']})...")
                # Clear complex dropdown before triggering AJAX
                await page.evaluate(f'''() => {{
                    document.getElementById("court_complex_code").options.length = 1;
                    document.getElementById("sess_dist_code").value = "{dist["value"]}"; 
                    fillCourtComplex("{dist["value"]}");
                }}''')
                
                # Wait for complexes to load
                try:
                    await page.wait_for_function('document.getElementById("court_complex_code").options.length > 1', timeout=15000)
                except Exception:
                    self.logger.warning(f"Timeout waiting for complexes in district {dist['text']}. Skipping.")
                    continue
                
                complexes = await page.evaluate('''() => {
                    const select = document.getElementById("court_complex_code");
                    return Array.from(select.options)
                        .filter(opt => opt.value && opt.value !== "0")
                        .map(opt => ({ value: opt.value, text: opt.text }));
                }''')
                
                for comp in complexes:
                    # Unique key for tracking progress
                    progress_key = f"{state['value']}|{dist['value']}|{comp['value']}|{self.from_date}|{self.to_date}"
                    
                    if self.resume and progress_key in self.processed_keys:
                        self.logger.info(f"    Skipping (Already Processed): {comp['text']}")
                        continue

                    self.logger.info(f"    Processing Complex: {comp['text']} ({comp['value']})...")
                    # Select and trigger data load
                    await page.evaluate(f'''() => {{
                        const select = document.getElementById("court_complex_code");
                        select.value = "{comp["value"]}";
                        funShowDefaultTab('complex'); 
                        set_data();
                    }}''')
                    
                    # Call the actual data processing logic
                    finished_successfully = await self.process_current_complex(page, state, dist, comp)
                    
                    if finished_successfully:
                        self.save_progress(progress_key)
                    
                    # Refresh to clear state before next complex (optional but safer)
                    # For now just continue

        await page.close()

    async def process_current_complex(self, page, state, dist, comp):
        try:
            from_date = self.from_date
            to_date = self.to_date
            
            # Organize folders by State and District
            # Clean folder names
            clean_state = re.sub(r'[^\w\s-]', '', state['text']).strip()
            clean_dist = re.sub(r'[^\w\s-]', '', dist['text']).strip()
            clean_comp = re.sub(r'[^\w\s-]', '', comp['text']).strip()
            
            folder_path = os.path.join("D:/ETL/District Court", clean_state, clean_dist, clean_comp, f"{from_date}_{to_date}")
            if not os.path.exists(folder_path):
                os.makedirs(folder_path)
                
            # Click Order Date tab
            try:
                await page.click('button#orderdate-tabMenu', timeout=5000)
                await page.wait_for_selector('#orderdatetab.active', timeout=5000)
            except:
                pass
                
            # Fill Dates
            await page.evaluate(f'document.getElementById("from_date").value="{from_date}";')
            await page.evaluate(f'document.getElementById("to_date").value="{to_date}";')
            await page.check('input#radfinalorderorderdt', timeout=5000)
            
            # CAPTCHA interceptors
            audio_content = []
            async def intercept_audio(response):
                if "securimage" in response.url.lower() and ("play" in response.url.lower() or response.url.endswith(".wav")):
                    try:
                        data = await response.body()
                        if len(data) > 1000:
                            audio_content.append(data)
                    except:
                        pass
            
            page.on("response", intercept_audio)
            
            # Download interceptor
            captured_pdf_urls = []
            async def intercept_json(response):
                if "display_pdf" in response.url.lower() and response.status == 200:
                    try:
                        data = await response.json()
                        if "order" in data:
                            captured_pdf_urls.append("https://services.ecourts.gov.in/ecourtindia_v6/" + data["order"])
                    except:
                        pass
            
            page.on("response", intercept_json)

            # Helper for fetch download
            async def download_pdf(url, output_path):
                try:
                    b64_data = await page.evaluate(f'''
                        async (url) => {{
                            const response = await fetch(url);
                            const blob = await response.blob();
                            return new Promise((resolve) => {{
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                                reader.readAsDataURL(blob);
                            }});
                        }}
                    ''', url)
                    pdf_bytes = base64.b64decode(b64_data)
                    if pdf_bytes.startswith(b'%PDF'):
                        with open(output_path, "wb") as f:
                            f.write(pdf_bytes)
                        return True
                except Exception as e:
                    self.logger.error(f"Download error: {e}")
                return False

            # Try solving captcha and submitting
            success = False
            for attempt in range(10):
                self.logger.info(f"      Captcha attempt {attempt + 1}/10")
                audio_content.clear()
                await page.click('img.captcha_play_image', force=True, timeout=10000)
                await page.wait_for_timeout(4000)
                
                if not audio_content:
                    # Refresh captcha if no audio
                    refresh_btn = await page.query_selector('img[src*="refresh-btn"]')
                    if refresh_btn: await refresh_btn.click()
                    await page.wait_for_timeout(2000)
                    continue

                captcha_text = self.solve_captcha(audio_content[-1])
                await page.fill('input#order_date_captcha_code', captcha_text, timeout=10000)
                await page.evaluate('submitOrderDate()')
                await page.wait_for_timeout(4000)

                # Close any custom modal if it exists (e.g., "Invalid Captcha" custom box)
                try:
                    # Targeted check for the button provided by the user
                    close_btn = await page.query_selector('button.btn-close[onclick*="validateError"], button.btn-close')
                    if close_btn and await close_btn.is_visible():
                        await close_btn.click()
                        await page.wait_for_timeout(1000)
                    else:
                        # Fallback: manually trigger the close function if the button isn't clickable
                        await page.evaluate("if(typeof closeModel === 'function') closeModel({modal_id:'validateError'});")
                except:
                    pass

                # Check for success (Broaden search for result links or the results table)
                if await page.query_selector('table a:has-text("Judgement"), table a:has-text("Judgment"), table a:has-text("JUDGEMENT"), table a:has-text("JUDGMENT"), table a:has-text("Copy of judgement"), table a:has-text("Copy of judgment"), table a:has-text("Copy of Judgement"), table a:has-text("Copy of Judgment")') or \
                   await page.query_selector('#res_date table, #order_date_results table'):
                    success = True
                    break
                
                # Check for "Record Not Found" or other specific site errors
                error_msg = await page.evaluate('document.getElementById("Error_alert") ? document.getElementById("Error_alert").innerText : ""')
                if error_msg:
                    self.logger.info(f"      Portal Message: {error_msg}")
                    if "Record Not Found" in error_msg:
                        self.logger.info("      No records found for this date range. Moving to next.")
                        page.remove_listener("response", intercept_audio)
                        page.remove_listener("response", intercept_json)
                        return True
                    # If it's something else like "Invalid Captcha", the loop will continue naturally
                
                # Additional check for the "Invalid Captcha" modal text specifically
                modal_text = await page.evaluate("() => { const m = document.querySelector('.modal-body'); return m ? m.innerText : ''; }")
                if "Invalid Captcha" in modal_text:
                    self.logger.warning("      Portal explicitly reported Invalid Captcha.")
                
                # If we reached here, captcha was likely wrong. Refresh it for next attempt.
                self.logger.warning("      Captcha failed or page didn't load. Refreshing...")
                refresh_btn = await page.query_selector('img[src*="refresh-btn"]')
                if refresh_btn: 
                    await refresh_btn.click()
                    await page.wait_for_timeout(2000)

            if success:
                global_idx = 0
                while True:
                    # Broaden link search for all common document labels
                    links = await page.query_selector_all('table a:has-text("Judgement"), table a:has-text("Judgment"), table a:has-text("JUDGEMENT"), table a:has-text("JUDGMENT"), table a:has-text("Copy of judgement"), table a:has-text("Copy of judgment"), table a:has-text("Copy of Judgement"), table a:has-text("Copy of Judgment")')
                    for link in links:
                        global_idx += 1
                        
                        file_name = f"{from_date}_{to_date}_{global_idx}.pdf"
                        file_path = os.path.join(folder_path, file_name)
                        
                        # File-level Checkpoint: Skip downloading if already exists
                        if os.path.exists(file_path):
                            self.logger.info(f"      File {file_name} already exists. Skipping.")
                            continue
                        
                        onclick = await link.get_attribute("onclick")
                        captured_pdf_urls.clear()
                        await page.evaluate(onclick)
                        
                        # Wait for URL
                        for _ in range(10):
                            if captured_pdf_urls: break
                            await page.wait_for_timeout(500)
                        
                        if captured_pdf_urls:
                            await download_pdf(captured_pdf_urls[0], file_path)
                            
                        # Close the PDF modal so it doesn't block future interactions
                        try:
                            close_pdf_btn = await page.query_selector('button.btn-close[onclick*="closefile"], button.btn-close[data-bs-dismiss="modal"]')
                            if close_pdf_btn and await close_pdf_btn.is_visible():
                                await close_pdf_btn.click()
                            else:
                                await page.evaluate("if(typeof closefile === 'function') closefile();")
                            
                            # Give it a short moment to animate closed
                            await page.wait_for_timeout(500)
                        except:
                            pass
                        
                    # Next page
                    next_btn = await page.query_selector('a:has-text("Next"), a:has-text(">>")')
                    if next_btn and await next_btn.is_visible():
                        await next_btn.click(timeout=10000)
                        await page.wait_for_timeout(5000)
                        # Hide overlay
                        await page.evaluate('if(document.getElementById("loading")) document.getElementById("loading").style.display="none"')
                    else:
                        break
                
                # Cleanup listeners and return success
                page.remove_listener("response", intercept_audio)
                page.remove_listener("response", intercept_json)
                return True

            # Cleanup listeners
            page.remove_listener("response", intercept_audio)
            page.remove_listener("response", intercept_json)
            return False # If we failed all 10 attempts or something else went wrong
        except Exception as e:
            self.logger.error(f"Critical error in process_current_complex: {str(e)}")
            try:
                page.remove_listener("response", intercept_audio)
                page.remove_listener("response", intercept_json)
            except:
                pass
            return False

    def solve_captcha(self, audio_bytes):
        # Decode audio using sf
        with open('temp_captcha.wav', 'wb') as f:
            f.write(audio_bytes)
            
        speech, sample_rate = sf.read('temp_captcha.wav')
        
        if sample_rate != 16000:
            speech = librosa.resample(speech, orig_sr=sample_rate, target_sr=16000)
            
        inputs = self.processor(speech, sampling_rate=16000, return_tensors="pt")
        input_features = inputs.input_features

        generated_ids = self.model.generate(inputs=input_features)
        transcription = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        
        # convert words to numbers
        word_map = {
            'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
            'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
        }
        
        text = transcription.lower()
        for word, num in word_map.items():
            text = text.replace(word, num)
            
        # clean transcription (lowercase only, letters and numbers)
        transcription = re.sub(r'[^a-z0-9]', '', text)
        return transcription
