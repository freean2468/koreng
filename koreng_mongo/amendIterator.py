# -*- coding: utf-8 -*- 

import io
import shutil
import os
import time
import enum
import json
from collections import OrderedDict
import sys

targetPath= "/Users/hoon-ilsong/project/koreng_mongo/archive"
savePath= "/Users/hoon-ilsong/project/koreng_mongo/archive_copy"
target = 'json'
exception = []

def checkException(target):
    for excep in exception:
        if target == excep:
            print(target)
            return True
    return False

def amend(path):
    lst = os.listdir(path)
    for d in lst:
        fileName=d.split(".")[0] 
        fileExtension=d.split(".")[-1]
        if fileExtension == target and not checkException(fileName):
            onTarget = path + "/" + d 
            with io.open(onTarget,"r", encoding="utf-8") as openFile:
                # print(onTarget)
                contents = json.load(openFile)

                '''
                for _data in contents["_data"]:
                    for _idx, __usage in enumerate(_data['__usage']):
                        # __usage["___image"]=[]
                        # __usage["___image"].append("")

                        for __idx, ___extra in enumerate(__usage['___extra']):
                            __usage['___extra'][__idx] = ___extra.replace(" T ", " Transitive ")
                            __usage['___extra'][__idx] = __usage['___extra'][__idx].replace(" I ", " Intransitive ")
                            __usage['___extra'][__idx] = __usage['___extra'][__idx].replace(" U ", " Uncountable ")
                            __usage['___extra'][__idx] = __usage['___extra'][__idx].replace(" C ", " Countable ")
                            __usage['___extra'][__idx] = __usage['___extra'][__idx].replace(" S ", " Singular ")
                            __usage['___extra'][__idx] = __usage['___extra'][__idx].replace(" L ", " Linking ")

                            print("wordset : " + contents["_wordset"] + ", ___extra : " + __usage['___extra'][__idx])
                            
                '''
                # old format -> new format code
                
                newContents = OrderedDict()

                newContents["_wordset"] = contents["_wordset"]

                newContents["_data"] = []

                for _data in contents["_data"]:
                    _temp = OrderedDict()

                    _temp["__represent"] = contents["_wordset"]
                    _temp["__speech"] = _data["__speech"]
                    _temp["__tense"] = ""
                    _temp["__pronounce"] = _data["__pronounce"]
                    _temp["__usage"] = []

                    for __usage in _data["__usage"]:
                        usage = OrderedDict()

                        usage["___extra"] = []
                        for extra in __usage["___extra"]:
                            usage["___extra"].append(extra)

                        usage["___origin"] = []
                        for origin in __usage["___origin"]:
                            usage["___origin"].append(origin)

                        usage["___meaningPiece"] = []
                        if "___meaningPeace" in __usage:
                            for meaningPeace in __usage["___meaningPeace"]:
                                usage["___meaningPiece"].append(meaningPeace)

                        if "___meaningPiece" in __usage:
                            print(contents["_wordset"])
                            for meaningPiece in __usage["___meaningPiece"]:
                                usage["___meaningPiece"].append(meaningPiece)

                        usage["___synonym"] = []
                        for synonym in __usage["___synonym"]:
                            usage["___synonym"].append(synonym)

                        usage["___not"] = []
                        for _not in __usage["___not"]:
                            usage["___not"].append(_not)

                        usage["___image"] = []
                        for image in __usage["___image"]:
                            usage["___image"].append(image)

                        usage["___meaning"] = __usage["___meaning"]

                        _temp["__usage"].append(usage)

                    newContents["_data"].append(_temp)

                newContents["_krSearch"] = []
                for _krSearch in contents["_krSearch"]:
                    newContents["_krSearch"].append(_krSearch)

                # print(newContents)
                
                # startIndex = 0
                # endIndex = contents.find('<h2>')
                # contents="".join((contents[:startIndex],'',contents[endIndex:]))
                # print(contents)
                
                with io.open(savePath + "/" + d,"w", encoding="utf-8") as openFileToWrite:
                    openFileToWrite.write(json.dumps(newContents, ensure_ascii=False, indent="\t"))

amend(targetPath)