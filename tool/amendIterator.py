# -*- coding: utf-8 -*- 

import io
import shutil
import os
import time
import enum
import json
import sys

pathBase= "/Users/hoon-ilsong/project/koreng/public/html_metadata"
target = 'html'
exception = [
    'generalmap',
    'feelingmap',
    'placemap',
    'verbmap'
]

def checkException(target):
    for excep in exception:
        if target == excep:
            print(target)
            return True
    return False

def amend(path):
    lst = os.listdir(path)
    for d in lst:
        if os.path.isdir(path + "/" + d):
            nextPath = path + "/" + d
            amend(nextPath)
        else:
            fileName=d.split(".")[0] 
            fileExtension=d.split(".")[-1]
            if fileExtension == target and not checkException(fileName):
                onTarget = path + "/" + d 
                with io.open(onTarget,"r", encoding="utf-8") as openFile:
                    contents = openFile.read()
                    # startIndex = 0
                    # endIndex = contents.find('<h2>')
                    # contents="".join((contents[:startIndex],'',contents[endIndex:]))
                    contents = contents.replace('<h2>','<h1>', 1)
                    contents = contents.replace('</h2>','</h1>', 1)
                    contents = contents.replace('<p>','<h3>', 1)
                    contents = contents.replace('</p>','</h3>', 1)
                    contents = contents.replace('<p>','<h5>', 1)
                    contents = contents.replace('</p>','</h5>', 1)
                    # print(contents)
                    # with io.open(onTarget,"w", encoding="utf-8") as openFileToWrite:
                    #     openFileToWrite.write(contents)

amend("/Users/hoon-ilsong/project/koreng/public/html_metadata/2_feelingmap")
amend("/Users/hoon-ilsong/project/koreng/public/html_metadata/3_generalmap")
amend("/Users/hoon-ilsong/project/koreng/public/html_metadata/4_verbmap")
amend("/Users/hoon-ilsong/project/koreng/public/html_metadata/5_placemap")