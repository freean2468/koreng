import requests
from bs4 import BeautifulSoup
import json
import os
from collections import OrderedDict
from shutil import copyfile

BASE_DIR = os.getcwd() + '/data'
ARCHIVE_PATH = os.getcwd() + "/../../"+"koreng_mongo/archive"
DB_DIR = os.getcwd() + "/../../"+"koreng_mongo/data"
DB_TABLE_PATH = os.getcwd() + "/../../"+"koreng_mongo//wordsetIndexTable.json"

start_urls = [

]

with open('en_list.txt', 'r') as f:
    idx = 0
    en_list = f.read()
    en_list = en_list.splitlines()

    for en in en_list:
        idx = idx+1
        en = en.replace(' ', '-')
        start_urls.append("https://dictionary.cambridge.org/dictionary/english/"+en)
        # if(idx > 20):
        #     break


# phrase Block process
for url in start_urls:
    req = requests.get(url)
    html = req.text
    soup = BeautifulSoup(html, 'html.parser')

    # cald4 = UK Dic
    di_body = soup.find("div", attrs={"data-id": "cald4"})
    
    if di_body is None:
        print("no results!!")
        continue

    di_body = di_body.select(
        'div.link > div > div.di-body'
    )

    phraseBlocks = di_body[0].find_all("div", attrs={"class":"phrase-block"})

    origin = url.split('/')[-1].lower().replace("-", " ")

    idx = 0
    for phraseBlock in phraseBlocks:    
        idx = idx +1
        print(idx)
        newContents = OrderedDict()
        newContents["_wordset"] = ""
        newContents["_data"] = []
        newContents["_krSearch"] = [""]
        meaningBlocks = phraseBlock.find_all("div", attrs={"class":"def ddef_d db"})

        data = OrderedDict()
        data["__represent"] = ""
        data["__speech"] = ""
        data["__tense"] = ""
        data["__pronounce"] = ""
        data["__usage"] = []

        extra = []

        dhw = phraseBlock.find("span", attrs={"class":"phrase-title"})
        if dhw is not None:
            dhw = dhw.text.split('/')[0]
            print("phraseBlock : " + dhw)
            data["__represent"] = dhw
            newContents["_wordset"] = dhw
            # check DB first
            with open(DB_TABLE_PATH) as json_file:
                json_data = json.load(json_file)
                # print(wordset)
                if dhw in json_data:
                    copyfile(ARCHIVE_PATH+'/'+dhw+'.json',DB_DIR+'/'+dhw+'.json')
                    print("========hey! \n phrase : '"+ dhw +"' exist already! file : "+dhw+'.json copied')
                    continue

        dpos = phraseBlock.find("span", attrs={"class":"pos dpos"})
        if dpos is not None:
            # print(dpos.text)
            data["__speech"] = dpos.text

        dgram = phraseBlock.find("span", attrs={"class":"gram dgram"})
        if dgram is not None:
            # print(dgram.text)
            dgram = dgram.text.replace(" T,", " Transitive,").replace(" T ", " Transitive ").replace(" I ", " Intransitive ").replace(" U ", " Uncountable ").replace(" C ", " Countable ").replace(" S ", " Singular ").replace(" L ", " Linking ")

            extra.append(dgram)

        ddomain = phraseBlock.find("span", attrs={"class":"domin ddomain"})
        if ddomain is not None:
            # print(ddomain.text)
            extra.append(ddomain.text)
        
        # dlab = phraseBlock.find("span", attrs={"class":"lab dlab"})
        # if dlab is not None:
        #     print(dlab.text)
        #     extra.append(dlab.text)

        dspellvar = phraseBlock.find("span", attrs={"class":"spellvar dspellvar"})
        if dspellvar is not None:
            # print(dspellvar.text)
            extra.append(dspellvar.text)

        for meaningBlock in meaningBlocks:
            usage = OrderedDict()
            usage["___extra"] = []
            usage["___origin"] = [origin]
            usage["___meaningPiece"] = [""]
            usage["___synonym"] = []
            usage["___not"] = []
            usage["___image"] = [""]
            usage["___meaning"] = meaningBlock.text.replace(": ", "").replace("→ \n", "").replace("\n", "")

            h = phraseBlock.find("div", attrs={"class":"phrase-head dphrase_h"})
            if h is not None:
                info = h.find("span", attrs={"class":"phrase-info dphrase-info"})
                if info is not None:
                    extra.append(info.text + ' ')

            dvar = meaningBlock.find_all("span", attrs={"class":"var dvar"})
            for _dvar in dvar:
                extra.append(_dvar.text + ' ')

            h = meaningBlock.find_parent("div", attrs={"class":"ddef_h"})
            if h is not None:
                dinfo = h.find("span", attrs={"class":"def-info ddef-info"})
                if dinfo is not None:
                    _filter = dinfo.text.replace("B1","").replace("B2","").replace("C1","").replace("C2","")
                    test = _filter.replace(" ", "")
                    if test != "":
                        extra.append(_filter + ' ')

            h = meaningBlock.find_parent("div", attrs={"class":"ddef_h"})
            s = h.find_next_sibling("div").find("div", attrs={"class":"synonyms"})
            o = h.find_next_sibling("div").find("div", attrs={"class":"opposite"})

            if s is not None:
                synonyms = s.find_all("span", attrs={"class":"x-h dx-h"})

                for synonym in synonyms:
                    usage["___synonym"].append(synonym.text)

            if o is not None:
                opposite = o.find_all("span", attrs={"class":"x-h dx-h"})
                for _opposite in opposite:
                    usage["___not"].append(_opposite.text)
            
            if len(usage["___synonym"]) == 0:
                usage["___synonym"].append("")

            if len(usage["___not"]) == 0:
                usage["___not"].append("")

            if len(extra) == 0:
                extra.append("")

            usage["___extra"] = extra
            
            data["__usage"].append(usage)
            newContents["_data"].append(data)

        with open(os.path.join(DB_DIR, data["__represent"] + '.json'), 'w+') as json_file:
            json.dump(newContents, json_file, ensure_ascii=False, indent=4)

# check DB for common process
with open(DB_TABLE_PATH) as json_file:
    json_data = json.load(json_file)
    for url in reversed(start_urls):
        wordset = url.replace('-', ' ').split('/')[-1].lower()
        # print(wordset)
        if wordset in json_data:
            start_urls.remove(url)
            copyfile(ARCHIVE_PATH+'/'+wordset+'.json',DB_DIR+'/'+wordset+'.json')
            print("========hey!\n '"+ wordset +"' exist already! file : "+ARCHIVE_PATH+'/'+wordset+'.json copied to ' + DB_DIR+'/'+wordset+'.json')

# common process
for url in start_urls:
    req = requests.get(url)
    html = req.text
    soup = BeautifulSoup(html, 'html.parser')

    newContents = OrderedDict()

    print('----------- ' + url.split('/')[-1].lower().replace("-", " ") + ' -------------')

    newContents["_wordset"] = url.split('/')[-1].lower().replace("-", " ")
    newContents["_data"] = []
    newContents["_krSearch"] = [""]

    # cald4 = UK Dic
    di_body = soup.find("div", attrs={"data-id": "cald4"})
    
    if di_body is None:
        with open(os.path.join(DB_DIR, url.split('/')[-1].lower().replace('-', '_no_results') + '.json'), 'w+') as json_file:
            json.dump(newContents, json_file, ensure_ascii=False, indent=4)
        print("no results!!")
        continue

    di_body = di_body.select(
        'div.link > div > div.di-body'
    )

    representBlocks = di_body[0].find_all("div", attrs={"class":"pos-header dpos-h"})

    meaningBlocks = di_body[0].find_all("div", attrs={"class":"ddef_h"})

    newDataList = []

    for representBlock in representBlocks:
        data = OrderedDict()
        data["__represent"] = ""
        data["__speech"] = ""
        data["__tense"] = ""
        data["__pronounce"] = ""
        data["__common"] = []
        data["__usage"] = []

        dhw = representBlock.find("span", attrs={"class":"hw dhw"})
        if dhw is not None:
            print(dhw.text)
            data["__represent"] = dhw.text

        dpos = representBlock.find("span", attrs={"class":"pos dpos"})
        if dpos is not None:
            # print(dpos.text)
            data["__speech"] = dpos.text

        dgram = representBlock.find("span", attrs={"class":"gram dgram"})
        if dgram is not None:
            # print(dgram.text)
            dgram = dgram.text.replace(" T,", " Transitive,").replace(" T ", " Transitive ").replace(" I ", " Intransitive ").replace(" U ", " Uncountable ").replace(" C ", " Countable ").replace(" S ", " Singular ").replace(" L ", " Linking ")

            data["__common"].append(dgram)

        ddomain = representBlock.find("span", attrs={"class":"domain ddomain"})
        if ddomain is not None:
            # print(ddomain.text)
            data["__common"].append(ddomain.text)
        
        dlab = representBlock.find("span", attrs={"class":"lab dlab"})
        if dlab is not None:
            # print(dlab.text)
            data["__common"].append(dlab.text)

        dspellvar = representBlock.find("span", attrs={"class":"spellvar dspellvar"})
        if dspellvar is not None:
            # print(dspellvar.text)
            data["__common"].append(dspellvar.text)

        dvar = representBlock.find_all("span", attrs={"class":"var dvar"})
        for _dvar in dvar:
            print(_dvar)
            data["__common"].append(_dvar.text + ' ')

        # dv = representBlock.find("span", attrs={"class":"v dv lmr-0"})
        # if dv is not None:
        #     # print(dlab.text)
        #     _dlab = dv.find_previous_sibling("span")
        #     if _dlab is not None:
        #         data["__common"].append(_dlab.text + ' ' + dv.text)
        #     else:
        #         data["__common"].append(dv.text)
        
        dinfls = representBlock.find("span", attrs={"class":"irreg-infls dinfls"})
        if dinfls is not None:
            # print(dinfls.text)
            data["__tense"] += dinfls.text + ' '
        
        uk = representBlock.find("span", attrs={"class":"uk dpron-i"})
        if uk is not None:
            dreg = uk.find("span", attrs={"class":"region dreg"})
            # print(dreg.text)
            dpron = uk.find("span", attrs={"class":"pron dpron"})
            # print(dpron.text)
            if dpron is None:
                dpron = ""
            else:
                dpron = dpron.text
            data["__pronounce"] = dreg.text.upper() + '  ' + dpron

        us = representBlock.find("span", attrs={"class":"us dpron-i"})
        if us is not None:
            dreg = us.find("span", attrs={"class":"region dreg"})
            # print(dreg.text)
            dpron = us.find("span", attrs={"class":"pron dpron"})
            # print(dpron.text)
            if dpron is None:
                dpron = ""
            else:
                dpron = dpron.text
            data["__pronounce"] = data["__pronounce"] + ' ' + dreg.text.upper() + '  ' + dpron

        newDataList.append(data)

    for meaningBlock in meaningBlocks:
        usage = OrderedDict()
        usage["___extra"] = []
        usage["___origin"] = [""]
        usage["___meaningPiece"] = [""]
        usage["___synonym"] = []
        usage["___not"] = []
        usage["___image"] = [""]
        usage["___meaning"] = ""

        extra = []
        thisExtra = []

        dinfo = meaningBlock.find("span", attrs={"class":"def-info ddef-info"})
        if dinfo is not None:
            _filter = dinfo.text.replace("B1","").replace("B2","").replace("C1","").replace("C2","")
            test = _filter.replace(" ", "")
            if test != "":
                _filter = _filter.replace(" T,", " Transitive,").replace(" T ", " Transitive ").replace(" I ", " Intransitive ").replace(" U ", " Uncountable ").replace(" C ", " Countable ").replace(" S ", " Singular ").replace(" L ", " Linking ").replace('\n', "")
                thisExtra.append(_filter + ' ')

        # dvar = meaningBlock.find_all("span", attrs={"class":"var dvar"})
        # for _dvar in dvar:
        #     print(_dvar)
        #     thisExtra.append(_dvar.text + ' ')

        ddef_d = meaningBlock.find("div", attrs={"class":"def ddef_d db"})
        if ddef_d is not None:
            # print(ddef_d.text)
            usage["___meaning"] = ddef_d.text.replace(": ", "").replace("→ \n", "").replace("\n", "")

            h = ddef_d.find_parent("div", attrs={"class":"ddef_h"}).find_next_sibling("div")
            if h is not None:
                s = h.find("div", attrs={"class":"synonyms"})
                o = h.find("div", attrs={"class":"opposite"})

                if s is not None:
                    synonyms = s.find_all("span", attrs={"class":"x-h dx-h"})
                    for synonym in synonyms:
                        usage["___synonym"].append(synonym.text)

                    synonyms = s.find_all("span", attrs={"class":"x-p dx-p"})
                    for synonym in synonyms:
                        usage["___synonym"].append(synonym.text)

                s = h.find("div", attrs={"class":"synonym"})

                if s is not None:
                    synonyms = s.find_all("span", attrs={"class":"x-h dx-h"})
                    for synonym in synonyms:
                        usage["___synonym"].append(synonym.text)

                    synonyms = s.find_all("span", attrs={"class":"x-p dx-p"})
                    for synonym in synonyms:
                        usage["___synonym"].append(synonym.text)

                if o is not None:
                    opposite = o.find_all("span", attrs={"class":"x-h dx-h"})
                    for _opposite in opposite:
                        usage["___not"].append(_opposite.text)

                    opposite = o.find_all("span", attrs={"class":"x-p dx-p"})
                    for _opposite in opposite:
                        usage["___not"].append(_opposite.text)

                o = h.find("div", attrs={"class":"opposites"})

                if o is not None:
                    opposite = o.find_all("span", attrs={"class":"x-h dx-h"})
                    for _opposite in opposite:
                        usage["___not"].append(_opposite.text)

                    opposite = o.find_all("span", attrs={"class":"x-p dx-p"})
                    for _opposite in opposite:
                        usage["___not"].append(_opposite.text)
                
            if len(usage["___synonym"]) == 0:
                usage["___synonym"].append("")

            if len(usage["___not"]) == 0:
                usage["___not"].append("")

            body = ddef_d.find_parent("div", attrs={"class":"pos-body"})
            head = ""
            dpos = ""

            if body is not None:
                head = body.find_previous_sibling("div")
                dpos = head.find("span", attrs={"class":"pos dpos"})
                if dpos is None:
                    dpos = ""
                else:
                    dpos = dpos.text
            else:
                body = ddef_d.find_parent("span", attrs={"class":"pv-body"})
                if body is not None:
                    head = body.find_previous_sibling("span")
                    dpos = head.find("span", attrs={"class":"anc-info-head danc-info-head"}).text + head.find("span", attrs={"class":"pos dpos"}).text
                # else:
                    # body = ddef_d.find_parent("span", attrs={"class":"idiom-body"})
                    

            for idx, item in enumerate(newDataList):
                if item["__speech"] == dpos:

                    for common in newDataList[idx]["__common"]:
                        extra.append(common)

                    for item in thisExtra:
                        extra.append(item)

                    usage["___extra"] = extra

                    if len(usage["___extra"]) == 0:
                        usage["___extra"].append("")

                    newDataList[idx]["__usage"].append(usage)

                    break
    
    relativeBlocks = di_body[0].find_all("div", attrs={"class":"pr relativDiv"})

    for relativeBlock in relativeBlocks:
        data = OrderedDict()
        data["__represent"] = ""
        data["__speech"] = ""
        data["__tense"] = ""
        data["__pronounce"] = ""
        data["__usage"] = []

        usage = OrderedDict()
        usage["___extra"] = []
        usage["___origin"] = [""]
        usage["___meaningPiece"] = [""]
        usage["___synonym"] = [""]
        usage["___not"] = [""]
        usage["___image"] = [""]
        usage["___meaning"] = ""

        extra = []
        thisExtra = []

        di_title = relativeBlock.find("div", attrs={"class":"di-title"})
        if di_title is not None:
            data["__represent"] = di_title.text

        danc_info = relativeBlock.find("span", attrs={"class":"danc-info-head"})
        if danc_info is not None:
            data["__speech"] = danc_info.text[2:]
            # print(data["__speech"])

        dlab = relativeBlock.find("span", attrs={"class":"lab dlab"})
        if dlab is not None:
            _filter = dlab.text.replace("B1","").replace("B2","").replace("C1","").replace("C2","")
            test = _filter.replace(" ", "")
            if test != "":
                _filter = _filter.replace(" T,", " Transitive,").replace(" T ", " Transitive ").replace(" I ", " Intransitive ").replace(" U ", " Uncountable ").replace(" C ", " Countable ").replace(" S ", " Singular ").replace(" L ", " Linking ").replace('\n', "")
                thisExtra.append(_filter + ' ')

        uk = relativeBlock.find("span", attrs={"class":"uk dpron-i"})
        if uk is not None:
            dreg = uk.find("span", attrs={"class":"region dreg"})
            # print(dreg.text)
            dpron = uk.find("span", attrs={"class":"pron dpron"})
            # print(dpron.text)
            if dpron is None:
                dpron = ""
            else:
                dpron = dpron.text
            data["__pronounce"] = dreg.text.upper() + '  ' + dpron

        us = relativeBlock.find("span", attrs={"class":"us dpron-i"})
        if us is not None:
            dreg = us.find("span", attrs={"class":"region dreg"})
            # print(dreg.text)
            dpron = us.find("span", attrs={"class":"pron dpron"})
            # print(dpron.text)
            if dpron is None:
                dpron = ""
            else:
                dpron = dpron.text
            data["__pronounce"] = data["__pronounce"] + ' ' + dreg.text.upper() + '  ' + dpron

        ddef_d = meaningBlock.find("div", attrs={"class":"def ddef_d db"})
        if ddef_d is not None:
            # print(ddef_d.text)
            usage["___meaning"] = ddef_d.text.replace(": ", "").replace("→ \n", "").replace("\n", "")

            for item in thisExtra:
                extra.append(item)

            usage["___extra"] = extra

            if len(usage["___extra"]) == 0:
                usage["___extra"].append("")

            data["__usage"].append(usage)
            newDataList[0] = data

    newContents["_data"] = newDataList

    for _data in newContents["_data"]:
        del _data["__common"]

    with open(os.path.join(DB_DIR, url.split('/')[-1].lower().replace('-', ' ') + '.json'), 'w+') as json_file:
        json.dump(newContents, json_file, ensure_ascii=False, indent=4)



