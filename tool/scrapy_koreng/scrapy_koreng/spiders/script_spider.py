import scrapy
import re
import json
import io
import StringIO
from collections import OrderedDict
import datetime

xlFile = "sample.xlsx"

class ScriptSpider(scrapy.Spider):
    name = "scripts"
    start_urls = [
        "https://dictionary.cambridge.org/dictionary/english/preceptor"
    ]

    def __init__(self):
        self.path = '/Users/hoon-ilsong/Documents/crawler products/'

        with open('en_list.txt', 'r') as f:
            en_list = f.read()
            en_list = en_list.splitlines()
            
            # idx = 0
            # for en in en_list:
            #     idx = idx+1
            #     en = en.replace(' ', '+')
            #     self.start_urls.append("https://dictionary.cambridge.org/dictionary/english/"+en)
            #     if(idx > 0):
            #         break

    def parse(self, response):
        print('response : ' + response.url)
        print('title : ' + response.xpath("//span[@class='hw dhw']/text()").get())
        print(response.xpath("//span[@class='pos dpos']/text()").get())
        print(response.xpath("//span[@class='pos dpos']/text()").get())

        # try:
        #     if "/summary/" in response.url: 

        #         outstanding = response.xpath("//td/text()")[2].get()
        #         # print(outstanding)

        #         Y = response.xpath("//span/text()")[59].get()
        #         # print(Y)

        #         code = response.xpath("//span/text()")[5].get()
        #         # print(code)

        #         price = response.xpath("//li/text()")[7].get()
        #         # print(price)

        #         ANI = response.xpath("//td/text()")[34].get() + "000000"
        #         # print(ANI)

        #         QNI = response.xpath("//td/text()")[37].get() + "000000"
        #         # print(QNI)

        #         # for node in response.xpath("//span/text()"):
        #         #     print(node)

        #         # for node in response.xpath("//td/text()"):
        #         #     print(node)

        #         # for idx, row in enumerate(self.sheet.rows):
        #         #     # print(row[0].value)
        #         #     if row[0].value == code:
        #         #         # print("I'm in!")
                        
        #         #         row[1].value = price
        #         #         row[2].value = outstanding
        #         #         row[3].value = ANI
        #         #         row[4].value = Y
        #         #         row[5].value = QNI
        #         #         return

        #         # Rows can also be appended
        #         self.sheet.append([code, price,	outstanding, ANI, Y, QNI, "=D3/$C$3",	"=F3/$C$3",	"=$B$3/G3",	"=$B$3/H3",	"Total Assets",	"Total liabilities",	"=(K3-L3)/C3",	"=B3/M3",	"Total Equity",	"=F3/O3*100",	"=D3/O3*100",	"=B3/S3",	"=($O3+$O3*($Q3-$C$1)/$C$1)/$C3", 	"=($O3+$O3*($Q3+T$2-$C$1)/$C$1)/$C3", 	"=($O3+$O3*($Q3+U$2-$C$1)/$C$1)/$C3", 	"=($O3+$O3*($Q3+V$2-$C$1)/$C$1)/$C3"])

        #         next_page = response.urljoin(response.url.replace('/summary/', '/financials/'))
        #         yield scrapy.Request(next_page, callback=self.parse)
                

        #     else:
        #         code = response.xpath("//span/text()")[5].get()
        #         # print('code : ' + code)

        #         # for node in response.xpath("//td/text()"):
        #         #     print(node)
                
        #         asset = ""
        #         liability = ""
        #         equity = ""

        #         for row in response.xpath('//table[@class="tableColtype typeScroll tableReports"]/tbody/tr'):
        #             asset = row.xpath('//tr[@class="totalAsset"]/td[2]//text()').extract_first() + "000000"
        #             liability = row.xpath('//tr[@class="totalAsset"][2]/td[2]//text()').extract_first() + "000000"
        #             equity = row.xpath('//tr[@class="totalAsset"][3]/td[2]//text()').extract_first() + "000000"
        #             break

        #         # for node in response.xpath("//span/text()"):
        #         #     print(node)

        #         # for node in response.xpath("//td/text()"):
        #         #     print(node)

        #         for idx, row in enumerate(self.sheet.rows):
        #             # print(row[0].value)
        #             if row[0].value == code:
        #                 # print("I'm in!")
                        
        #                 row[10].value = asset
        #                 row[11].value = liability
        #                 row[14].value = equity
        #                 self.wb.save(xlFile)
        #                 print("code : "+code+", saved!")
        #                 return

        # except Exception as ex:
        #     print('ex : ' + ex + ', No code : ' + response.url)
        #     print('No code : ' + response.url)
