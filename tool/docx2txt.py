from docx import Document
import io
import shutil
import os

filePathBase= "/Users/hoon-ilsong/Documents"
savePathBase= "/Users/hoon-ilsong/project/koreng/data"

def mkdirOnSavePath(path):
    if not os.path.isdir(path):
        os.mkdir(path)

def convertDocxToText(filePath, savePath, category):
    for d in os.listdir(filePath):
        if os.path.isdir(filePath + "/" + d):
            mkdirOnSavePath(savePath + "/" + d)
            convertDocxToText(filePath + "/" + d, savePath + "/" + d, category)
        else:
            fileExtension=d.split(".")[-1]
            if fileExtension =="docx":
                docxFilename = filePath + "/" + d
                textFilename = savePath + "/" + d.split(".")[0] + ".txt"
                jsonFilename = savePath + "/" + d.split(".")[0] + ".json"
                if not os.path.isfile(textFilename):
                    document = Document(docxFilename)
                    print(docxFilename)
                    print("--->" + textFilename)
                    with io.open(textFilename,"w", encoding="utf-8") as textFile:
                        for para in document.paragraphs:
                            textFile.write(unicode(para.text+'\n'))
                    print("--->" + jsonFilename)
                    with io.open(jsonFilename,"w", encoding="utf-8") as jsonFile:
                        jsonFile.write(unicode(
'''{
    "category":"''' + category + '''",
    "title":"''' + d.split(".")[0] + '''",
    "language":"US-en",
    "contents":""
}''')
                        )

category = "book"

convertDocxToText(filePathBase + "/" + category, savePathBase + "/" + category, category)

category = "drama"

mkdirOnSavePath(savePathBase + "/" + category)

convertDocxToText(filePathBase + "/" + category, savePathBase + "/" + category, category)
