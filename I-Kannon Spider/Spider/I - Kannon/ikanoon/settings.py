import os
from pathlib import Path

# Scrapy settings for ikanoon project

BOT_NAME = "ikanoon"

SPIDER_MODULES = ["ikanoon.spiders"]
NEWSPIDER_MODULE = "ikanoon.spiders"

# Crawl responsibly by identifying yourself (and your website) on the user-agent
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Obey robots.txt rules
ROBOTSTXT_OBEY = False

# Configure a delay for requests for the same website (default: 0)
DOWNLOAD_DELAY = 3
CONCURRENT_REQUESTS_PER_DOMAIN = 1
CONCURRENT_REQUESTS = 1

# Configure item pipelines
ITEM_PIPELINES = {
   "ikanoon.pipelines.MarkdownAndPDFPipeline": 300,
}

# Ensure output directories exist relative to the spider project
PROJECT_ROOT = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUTPUT_DIR = PROJECT_ROOT / "output"
MD_DIR = OUTPUT_DIR / "md"
PDF_DIR = OUTPUT_DIR / "pdfs"

os.makedirs(MD_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)

# Set settings whose default value is deprecated to a future-proof value
REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"
