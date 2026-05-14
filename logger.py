import logging
import os
from datetime import datetime

# Shared state for frontend logs
frontend_log_buffer = []

def setup_logging():
    # 1. File Logging
    log_file = "scraper.log"
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )

def log_event(message, level="info"):
    """
    Unified logging function:
    - Writes to scraper.log
    - Prints to console
    - Updates frontend_log_buffer for real-time dashboard updates
    """
    prefix = {
        "info": "[INFO]",
        "auth": "[AUTH]",
        "net": "[NET ]",
        "scraper": "[SCRP]",
        "error": "[ERR ]",
        "success": "[OK  ]"
    }.get(level.lower(), "[LOG ]")
    
    timestamp = datetime.now().strftime("%H:%M:%S")
    formatted_msg = f"{prefix} {message}"
    
    # Update Python Logging
    if level == "error":
        logging.error(message)
    else:
        logging.info(formatted_msg)
        
    # Update Frontend Buffer
    frontend_log_buffer.append(formatted_msg)
    if len(frontend_log_buffer) > 100:
        frontend_log_buffer.pop(0)

def get_logs():
    return frontend_log_buffer
