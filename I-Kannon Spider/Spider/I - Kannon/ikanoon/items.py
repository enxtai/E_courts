import scrapy

class IkanoonItem(scrapy.Item):
    case_id = scrapy.Field()
    case_title = scrapy.Field()
    judgment_text = scrapy.Field()
    doc_url = scrapy.Field()
    year = scrapy.Field()
    court = scrapy.Field()
