import scrapy
import re
import os
import glob
from urllib.parse import unquote
from ikanoon.items import IkanoonItem
from ikanoon.settings import PDF_DIR

class KanoonSpider(scrapy.Spider):
    name = "kanoon_spider"
    
    def __init__(self, start_url=None, *args, **kwargs):
        super(KanoonSpider, self).__init__(*args, **kwargs)
        if start_url:
            self.start_urls = [start_url]
        else:
            self.start_urls = ["https://indiankanoon.org/browse/"]

    def start_requests(self):
        for url in self.start_urls:
            if '/browse' in url:
                yield scrapy.Request(url, callback=self.parse_browse)
            else:
                yield scrapy.Request(url, callback=self.parse_search_results)

    def parse_browse(self, response):
        self.logger.info(f"Parsing browse page: {response.url}")
        court_links = response.css('table.browsecat a::attr(href)').extract()
        for href in court_links:
            yield response.follow(href, self.parse_court)

    def parse_court(self, response):
        self.logger.info(f"Parsing court page: {response.url}")
        year_links = response.css('div.browselist a::attr(href)').extract()
        for href in year_links:
            yield response.follow(href, self.parse_year)

    def parse_year(self, response):
        self.logger.info(f"Parsing year page: {response.url}")
        entire_year_link = response.xpath("//a[contains(text(), 'Entire Year')]/@href").get()
        if entire_year_link:
            yield response.follow(entire_year_link, self.parse_search_results)

    def parse_search_results(self, response):
        self.logger.info(f"Parsing search page: {response.url}")
        
        # Decode url for easier regex
        decoded_url = unquote(response.url)
        
        # Extract year from URL if available
        year_match = re.search(r'year:\s*(\d+)', decoded_url)
        year = year_match.group(1) if year_match else 'misc'

        # Extract court from URL if available
        court_match = re.search(r'doctypes:\s*([a-zA-Z]+)', decoded_url)
        court = court_match.group(1) if court_match else 'misc'

        # Ensure year directory logic matches pipeline
        year_dir = os.path.join(PDF_DIR, str(court), str(year))

        # Follow document links on the current page
        doc_links = response.css('a::attr(href)').extract()
        for href in doc_links:
            if '/doc/' in href and '/docfragment/' not in href:
                case_id = href.strip('/').split('/')[-1]
                # Check point: if file exists, skip
                if glob.glob(os.path.join(year_dir, f"{case_id}_*.pdf")):
                    self.logger.info(f"Checkpoint: Skipping already downloaded case_id {case_id}")
                    continue
                
                # If it's a relative link, follow it
                yield response.follow(href, self.parse_judgment, cb_kwargs={'year': year, 'court': court})
                
        # Follow pagination
        next_page = response.xpath("//a[contains(text(), 'Next')]/@href").get()
        if next_page:
            yield response.follow(next_page, self.parse_search_results)

    def parse_judgment(self, response, year='misc', court='misc'):
        item = IkanoonItem()
        item['year'] = year
        item['court'] = court
        item['doc_url'] = response.url
        item['case_id'] = response.url.strip('/').split('/')[-1]
        
        # Extract title
        title = response.css('.doc_title::text').get()
        if not title:
            # Fallback title extraction if class varies
            title = response.css('h2::text').get()
        item['case_title'] = title.strip() if title else 'Unknown Title'

        # Extract judgment details
        judgments_div = response.css('div.judgments')
        if judgments_div:
            # We want to extract content blocks recursively or specifically target structural elements
            content_blocks = []
            
            # Simple text extraction from direct p, blockquote, pre tags within the judgments div
            for element in judgments_div.css('*'):
                tag_name = element.root.tag
                if tag_name in ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4']:
                    # Extract text robustly excluding scripts/styles
                    text = ' '.join(element.css('*::text').getall()).strip()
                    # To avoid duplicating sub-texts we just extract text from these blocks
                    # But if we use *::text, inner tags are also extracted, which is good (e.g. bolding, links).
                    if text:
                        content_blocks.append(text)
                        
            item['judgment_text'] = '\n\n'.join(content_blocks)
        else:
            item['judgment_text'] = 'No judgment text found.'
            
        self.logger.info(f"Scraped judgment: {item['case_title']}")
        yield item
