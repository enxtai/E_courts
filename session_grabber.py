import asyncio
import json
import re
import base64
from pathlib import Path
from datetime import datetime
from playwright.async_api import async_playwright
from logger import log_event

class ECourtsSession:
    """
    The ONLY approach that works with this site:
    1. Drive the UI (set dropdowns, dates, click buttons) 
    2. Intercept the AJAX response via page.expect_response
    
    ajaxCall() is synchronous jQuery AJAX that reads state from the DOM.
    The server validates session state. We MUST set DOM state properly.
    """

    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        self.app_token = None
        self.is_ready = False
        self.playwright = None
        self.court_map = {}

    async def capture_session(self):
        """Launches browser, waits for captcha, captures session."""
        try:
            log_event("Initializing session grabber...", "auth")
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(headless=False)
            self.context = await self.browser.new_context()
            self.page = await self.context.new_page()

            url = "https://judgments.ecourts.gov.in/pdfsearch/index.php"
            log_event(f"Opening {url}...", "net")
            await self.page.goto(url)

            try:
                await self.page.wait_for_selector("#fcourt_type", timeout=10000)
                await self.page.select_option("#fcourt_type", "2")
            except:
                pass

            log_event("Please solve the captcha and click 'Search' in the browser window...", "auth")

            # Wait for results page (captcha solved + search done)
            # We wait until app_token is populated AND url changes - that's PROOF captcha was solved
            start_time = asyncio.get_event_loop().time()
            timeout = 300  # 5 minutes
            
            while (asyncio.get_event_loop().time() - start_time) < timeout:
                try:
                    # Check multiple signals that captcha is solved
                    state = await self.page.evaluate("""() => ({
                        url: window.location.href,
                        hasToken: !!(document.getElementById('app_token')?.value),
                        tokenLen: (document.getElementById('app_token')?.value || '').length,
                        hasCourts: document.querySelectorAll('#state_code option').length,
                        hasSearchFn: typeof get_details_searchclick === 'function'
                    })""")
                    
                    url_changed = "pdf_search/home" in state.get("url", "")
                    token_valid = state.get("tokenLen", 0) > 10
                    has_courts = state.get("hasCourts", 0) > 1
                    
                    if url_changed and token_valid:
                        log_event(f"Captcha solved! Token={state['tokenLen']} chars, Courts={state['hasCourts']}", "scraper")
                        await asyncio.sleep(3)  # Let everything settle
                        break
                except:
                    pass
                await asyncio.sleep(1.5)
            else:
                log_event("Timeout waiting for captcha solve.", "error")
                return False

            # Map courts from #state_code dropdown
            self.court_map = await self.page.evaluate("""() => {
                const map = {};
                const sel = document.getElementById('state_code');
                if (sel) {
                    for (const opt of sel.options) {
                        if (opt.value) map[opt.textContent.trim()] = opt.value;
                    }
                }
                return map;
            }""")
            log_event(f"Mapped {len(self.court_map)} courts.", "success")
            
            if self.court_map:
                sample = list(self.court_map.items())[:3]
                log_event(f"Court sample: {sample}", "scraper")

            # Capture app_token
            self.app_token = await self.page.evaluate(
                "() => document.getElementById('app_token')?.value"
            )
            if not self.app_token:
                log_event("Failed to extract app_token.", "error")
                return False

            # Dump the search function for debugging
            try:
                func_src = await self.page.evaluate(
                    "() => typeof get_details_searchclick !== 'undefined' ? 'EXISTS' : 'NOT_FOUND'"
                )
                log_event(f"get_details_searchclick: {func_src}", "scraper")
            except:
                pass

            self.is_ready = True
            log_event("Session captured and ready!", "success")
            return True

        except Exception as e:
            log_event(f"Session capture failed: {e}", "error")
            return False

    async def search_judgments(self, state_code, from_date, to_date, keyword="", start=0):
        """
        DEFINITIVE approach - two-layer coverage:
        1. Patch $.fn.val() BEFORE get_details_searchclick() captures closure vars
        2. After DataTable is created, override fnServerData to re-inject dates into aoData
        Both layers together guarantee dates reach the server.
        """
        if not self.page:
            return None

        log_event(f"Search: court={state_code} dates={from_date}->{to_date} start={start}", "net")

        try:
            if start == 0:
                # === FIRST PAGE ===
                # Step 1: Install persistent $.fn.val patch BEFORE triggering search
                # This ensures when get_details_searchclick() reads values, it gets ours
                await self.page.evaluate("""([sc, fd, td]) => {
                    // ===== PATCH 1: $.fn.val — intercept date/court reads =====
                    const _origVal = $.fn.val;
                    $.fn.val = function() {
                        if (arguments.length === 0) {
                            const id = this[0]?.id;
                            const name = this[0]?.name;
                            if (id === 'from_date' && fd) return fd;
                            if (id === 'to_date' && td) return td;
                            if (id === 'state_code' && sc) return sc;
                            if (name === 'exampleRadios' && this[0]?.checked && fd) return 'CUSTOM';
                        }
                        return _origVal.apply(this, arguments);
                    };
                    window.__origVal = _origVal;

                    // ===== PATCH 2: $.fn.DataTable — inject 1000 records + dates at init =====
                    // get_details_searchclick() destroys+recreates the DataTable each search.
                    // By patching the constructor we intercept its options BEFORE it fires.
                    const _origDT = $.fn.DataTable;
                    $.fn.DataTable = function(opts) {
                        if (opts && typeof opts.fnServerData === 'function') {
                            // Force 1000 records per page from the very first request
                            opts.iDisplayLength = 1000;
                            const _origFn = opts.fnServerData;
                            opts.fnServerData = function(url, aoData, fnCallback) {
                                aoData.forEach(item => {
                                    if (item.name === 'from_date')      item.value = fd;
                                    if (item.name === 'to_date')        item.value = td;
                                    if (item.name === 'date_val')       item.value = fd ? 'CUSTOM' : 'ALL';
                                    if (item.name === 'state_code')     item.value = sc;
                                    if (item.name === 'state_code_li')  item.value = sc;
                                    if (item.name === 'iDisplayLength') item.value = '1000';
                                });
                                console.log('aoData injection:', JSON.stringify(
                                    aoData.filter(x => ['from_date','to_date','date_val','state_code','iDisplayLength'].includes(x.name))
                                ));
                                _origFn.call(this, url, aoData, fnCallback);
                            };
                        }
                        return _origDT.apply(this, arguments);
                    };
                    $.fn.dataTable = $.fn.DataTable;
                    window.__origDT = _origDT;

                    // Set DOM values for visual + event consistency
                    const sel = document.getElementById('state_code');
                    if (sel) sel.value = sc;
                    if (fd) {
                        const customRadio = document.querySelector('input[name="exampleRadios"][value="CUSTOM"]');
                        if (customRadio) customRadio.checked = true;
                    }

                    console.log('Patches installed. val check:',
                        '$from_date =', $('#from_date').val(),
                        '$state_code =', $('#state_code').val()
                    );
                }""", [state_code, from_date, to_date])
                
                await asyncio.sleep(0.3)


                # Step 2: Trigger search and intercept response
                try:
                    async def log_request(request):
                        if "pdf_search/home" in request.url and request.method == "POST":
                            log_event(f"FINAL POST PAYLOAD: {request.post_data}", "net")
                            
                    self.page.on("request", log_request)
                    
                    async with self.page.expect_response(
                        lambda r: "pdf_search/home" in r.url and r.status == 200,
                        timeout=30000
                    ) as response_info:
                        await self.page.evaluate("""() => {
                            get_details_searchclick('','','','','','');
                        }""")

                    self.page.remove_listener("request", log_request)

                    response = await response_info.value
                    raw_text = await response.text()
                    log_event(f"RAW ({len(raw_text)} chars): {raw_text[:300]}", "scraper")
                    
                    data = json.loads(raw_text)
                    rr = data.get("reportrow", data)
                    total = rr.get("iTotalRecords") or 0
                    count = len(rr.get("aaData", []))
                    log_event(f"Got {count} records (total: {total})", "net")
                    
                    # Restore original .val()
                    await self.page.evaluate("""() => {
                        if (window.__origVal) {
                            $.fn.val = window.__origVal;
                            delete window.__origVal;
                        }
                    }""")
                    
                    # Update token
                    new_token = await self.page.evaluate(
                        "() => document.getElementById('app_token')?.value"
                    )
                    if new_token:
                        self.app_token = new_token

                    # Step 3: Override fnServerData on the now-created DataTable
                    # aoData is what actually goes to server - override values there
                    await self.page.evaluate("""([sc, fd, td, kw]) => {
                        try {
                            const dt = $('#example_pdf').dataTable();
                            const settings = dt.fnSettings();
                            const origFn = settings.fnServerData;
                            settings.fnServerData = function(url, aoData, fnCallback) {
                                aoData.forEach(item => {
                                    if (item.name === 'from_date')     item.value = fd;
                                    if (item.name === 'to_date')       item.value = td;
                                    if (item.name === 'date_val')      item.value = fd ? 'CUSTOM' : 'ALL';
                                    if (item.name === 'state_code')    item.value = sc;
                                    if (item.name === 'state_code_li') item.value = sc;
                                    if (item.name === 'iDisplayLength') item.value = '1000';
                                    if (item.name === 'search_txt1' && kw) item.value = kw;
                                });
                                console.log('fnServerData aoData:', JSON.stringify(
                                    aoData.filter(x => ['from_date','to_date','date_val','state_code','iDisplayLength'].includes(x.name))
                                ));
                                origFn.call(this, url, aoData, fnCallback);
                            };
                            settings._iDisplayLength = 1000;
                            console.log('fnServerData override installed OK');
                        } catch(e) { console.error('fnServerData override failed:', e); }
                    }""", [state_code, from_date, to_date, keyword])

                    return data

                except Exception as e:
                    log_event(f"Search failed: {e}", "error")
                    # Restore .val() on error
                    await self.page.evaluate("""() => {
                        if (window.__origVal) { $.fn.val = window.__origVal; delete window.__origVal; }
                    }""")
                    return None

            else:
                # === SUBSEQUENT PAGES (fnServerData override already active) ===
                log_event(f"Fetching page at offset {start}...", "net")
                
                try:
                    async with self.page.expect_response(
                        lambda r: "pdf_search/home" in r.url and r.status == 200,
                        timeout=30000
                    ) as response_info:
                        await self.page.evaluate(f"""() => {{
                            try {{
                                const settings = $('#example_pdf').dataTable().fnSettings();
                                settings._iDisplayStart = {start};
                                settings._iDisplayLength = 1000;
                                $('#example_pdf').dataTable().fnDraw(false);
                            }} catch(e) {{
                                console.error('Pagination error:', e);
                            }}
                        }}""")

                    response = await response_info.value
                    data = await response.json()
                    
                    rr = data.get("reportrow", data)
                    count = len(rr.get("aaData", []))
                    log_event(f"Page: {count} records ({len(json.dumps(data, default=str))} bytes)", "net")
                    
                    new_token = await self.page.evaluate(
                        "() => document.getElementById('app_token')?.value"
                    )
                    if new_token:
                        self.app_token = new_token
                    
                    return data

                except Exception as e:
                    log_event(f"Pagination failed: {e}", "error")
                    return None

        except Exception as e:
            log_event(f"Search error: {e}", "error")
            return None

    async def download_pdf_binary(self, judgment_id):
        """Downloads a PDF by triggering the site's own open_pdf() and intercepting the response.
        
        The site validates sessions server-side. Direct fetch() to the PDF path returns
        a ~1950 byte HTML error page. We must use the site's own JS flow.
        """
        if not self.page:
            return None

        try:
            clean_path = judgment_id.split('#')[0].strip()
            
            # Primary strategy: Call open_pdf() and intercept the actual PDF response
            try:
                async with self.page.expect_response(
                    lambda r: r.url.endswith('.pdf') and r.status == 200,
                    timeout=15000
                ) as response_info:
                    await self.page.evaluate("""([path]) => {
                        if (typeof open_pdf === 'function') {
                            open_pdf('0', '', path);
                        }
                    }""", [judgment_id])

                response = await response_info.value
                body = await response.body()
                
                # Close the modal immediately
                await self.page.evaluate("""() => {
                    try {
                        $('#viewFiles').modal('hide');
                        $('.modal-backdrop').remove();
                        $('body').removeClass('modal-open').css('overflow', '');
                    } catch(e) {}
                }""")
                
                if body and len(body) > 500 and body[:5] == b'%PDF-':
                    import base64 as b64mod
                    return b64mod.b64encode(body).decode('ascii')
                else:
                    ct = response.headers.get('content-type', '')
                    log_event(f"PDF response not valid: ct={ct} size={len(body) if body else 0}", "error")
                    
            except Exception as e:
                # Close any leftover modal
                try:
                    await self.page.evaluate("""() => {
                        try {
                            $('#viewFiles').modal('hide');
                            $('.modal-backdrop').remove();
                            $('body').removeClass('modal-open').css('overflow', '');
                        } catch(e) {}
                    }""")
                except:
                    pass
                log_event(f"open_pdf intercept: {e}", "error")
            
            # Fallback: Direct fetch with app_token from DOM
            try:
                b64 = await self.page.evaluate("""
                    async ([jid]) => {
                        try {
                            const cleanPath = jid.split('#')[0].trim();
                            const token = document.getElementById('app_token')?.value || '';
                            const base = document.getElementById('base_url')?.value || '/pdfsearch';
                            
                            // Try with app_token as query param
                            const url = base + '/' + cleanPath + '?app_token=' + token;
                            const r = await fetch(url);
                            if (r.ok) {
                                const buf = await r.arrayBuffer();
                                const u8 = new Uint8Array(buf);
                                if (u8.length > 500 && u8[0] === 0x25 && u8[1] === 0x50) { // %P
                                    let s = '';
                                    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
                                    return btoa(s);
                                }
                                console.log('Fallback fetch: size=' + u8.length + ' first2=' + u8[0] + ',' + u8[1]);
                            }
                            return null;
                        } catch(e) { 
                            console.error('Fallback fetch error:', e);
                            return null; 
                        }
                    }
                """, [judgment_id])
                
                if b64:
                    return b64
                    
            except Exception as e:
                log_event(f"Fallback fetch failed: {e}", "error")
            
            return None
        except Exception as e:
            log_event(f"download_pdf_binary error: {e}", "error")
            return None

    async def close(self):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        self.is_ready = False
