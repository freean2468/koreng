# -*- coding: utf-8 -*- 

import io
import shutil
import os
import time
import enum
import json
import sys

class Menu(object):
    def __init__(self, parent, name, menu_title, path, category):
        self.parent = parent
        self.name = name
        self.menu_title = menu_title
        self.path = path
        self.category = category

URL = 'http://localhost:5000'


jsonPathBase= "/Users/hoon-ilsong/project/koreng/public/html_metadata"
HTMLPathBase= "/Users/hoon-ilsong/project/koreng/public/html"
appPathBase= "/Users/hoon-ilsong/project/koreng"
URLSourcePathBase= "public/html"

OVERWRITE =True
                        
def mkdirOnPath(path):
    if not os.path.isdir(path):
        os.mkdir(path)

def jsonToHTMLHeader(jsonPath, HTMLPath):
    for d in os.listdir(jsonPath):
        if os.path.isdir(jsonPath + "/" + d):
            mkdirOnPath(HTMLPath + "/" + d)
            jsonToHTMLHeader(jsonPath + "/" + d, HTMLPath + "/" + d)
        else:
            fileExtension=d.split(".")[-1]
            if fileExtension =="json":
                jsonFile = jsonPath + "/" + d
                articleFile = jsonPath + "/" + d.split(".")[0] + ".html"
                HTMLFile = HTMLPath + "/" + d.split(".")[0] + ".html"
                if not os.path.isfile(HTMLFile) or OVERWRITE:
                    print("from : "+jsonFile)
                    with io.open(jsonFile,"r", encoding="utf-8") as jsonOpen:
                        jsonData = json.load(jsonOpen)

                        with io.open(HTMLFile,"w", encoding="utf-8") as textFile:
                            html = '''
<!doctype html>
<html>
    <head>
        <title>'''+jsonData['title']+'''</title>
        <meta charset="utf-8">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/js-cookie@beta/dist/js.cookie.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.9.4/cytoscape.min.js"></script>
        <script src="https://unpkg.com/layout-base/layout-base.js"></script>
        <script src="https://unpkg.com/cose-base/cose-base.js"></script>
        <script src="https://unpkg.com/cytoscape-cose-bilkent@4.0.0/cytoscape-cose-bilkent.js"></script>
        <script src="https://unpkg.com/popper.js@1.16.0/dist/umd/popper.js"></script>
        <script src="https://unpkg.com/tippy.js@5.1.3/dist/tippy-bundle.iife.min.js"></script>
        <script src="https://unpkg.com/cytoscape-popper@1.0.6/cytoscape-popper.js"></script>
        <script src="./js/search.js"></script>
        <script src="./js/general.js"></script>
        <script src="https://unpkg.com/@trevoreyre/autocomplete-js"></script>
        <link rel="stylesheet" type="text/css" href="./style/autocomplete.css">
    </head>'''
                            if jsonData["pos"] == "home" or jsonData["pos"] == "main":
                                html +='''
    <body id="index" class="no_sidebar">'''
                            else:
                                html +='''
    <body id="index">'''

                            html +='''
        <div id="whole_wrapper">
            <div class="head">
                <header>
                    <hgroup>
                        <p class="title"><a href="'''+URL+'''">삼시세끼 아그작 영어</a></p>
                        <p class="subtitle"><small>영어를 영어로 이해하는 그 순간</small></p>
                        <nav id="search_group">
                            <div class="sgroup">
                                <form class="search" action="/search" style="overflow:visible" data-submitfalse="q" method="GET" role="search">
                                    <div id="autocomplete" class="autocomplete" >
                                        <input class="autocomplete-input" name="target" maxlength="2048" type="text" aria-autocomplete="both" aria-haspopup="false" autocapitalize="off" autocomplete="off" autocorrect="off" role="combobox" spellcheck="false" title="검색" aria-label="검색"/>
                                        <ul class="autocomplete-result-list"></ul>
                                    </div>

                                    <div class="item_btn">
                                        <input class="search_btn" value="Agjak 검색" aria-label="Agjak 검색" name="btnK" type="submit">
                                    </div>
                                </form>
                            </div>
                        </nav> <!-- search_group -->
                        <nav id="main_menu">
                            <div class="wrapper">
                                <ul class="sub_nav">'''

                            for main in mainMenus:
                                html += '''
                                    <li>
                                        <!--<li class="selected">-->
                                        <div class="label public">
                                            <a class="pagelink" href="'''+URL+'/'+main.name+'">'+main.menu_title+'''</a>
                                        </div>
                                        <div class="sub_nav depth_1" style="left: -51px; position: absolute; width: 199px; display: none;" loaded="true">
                                            <ul class="sub_nav">'''

                                for sub in subMenus:
                                    # print('sub.parent : ' + sub.parent + ', main.name : ' + main.name)
                                    if sub.parent.split('_')[-1] == main.name.split('_')[-1]:
                                        html += '''
                                                <li>
                                                    <div class="label public">
                                                        <a class="courselink" href="'''+URL+'/'+sub.name+'">'+sub.menu_title+'''
                                                        </a>
                                                    </div>
                                                </li>'''
                                html += '''
                                            </ul>
                                        </div>
                                    </li>'''

                            html += '''
                                </ul>
                            </div>
                        </nav>
                    </hgroup> <!-- hgroup -->
                </header>
            </div> <!-- head -->
            <script>
                const wikiUrl = 'https://en.wikipedia.org'
                const params = 'action=query&list=search&format=json&origin=*'

                new Autocomplete('#autocomplete', {
                    // Search function can return a promise which resolves with an array of
                    // results. In this case we're using the Wikipedia search API.
                    search: input => {
                        const url = `${wikiUrl}/w/api.php?${params}&srsearch=${encodeURI(input)}`

                        return new Promise(resolve => {
                        if (input.length < 1) {
                            return resolve([])
                        }

                        fetch(url)
                            .then(response => response.json())
                            .then(data => {
                                resolve(data.query.search)
                            })
                        })
                    },
                    
                    // Wikipedia returns a format like this: 
                    // {
                    //   pageid: 12345,
                    //   title: 'Article title',
                    //   ...
                    // } 
                    // We want to display the title
                    getResultValue: result => result.title,

                    // Open the selected article in a new window
                    onSubmit: result => {
                        window.open(`${wikiUrl}/wiki/${encodeURI(result.title)}`)
                    }
                })
            </script>

            <div id="body">
                <div id="cols">
                    <div class="wrapper">'''
                            # search
                            if jsonData["category"] == 'search':
                                textFile.write(html)
                                print("--->" + HTMLFile)
                                continue

                            # side menu                            
                            if jsonData["pos"] == 'sub' or jsonData["pos"] == 'side':
                                subHref = 'sub_' + d.split('.')[0]

                                if jsonData["pos"] == 'side':
                                    for sub in subMenus:
                                        if sub.name == 'sub_'+jsonData["parent"]:
                                            subHref = sub.name
                                            break

                                html += '''
                        <aside>
                            <div id="list_index" class="index">
                                <div class="cover selected">
                                    <h2 style="text-align: center"><a href="'''+URL+'/'+subHref+'">'+jsonData["sub_title"]+'''</a>
                                    </h2>
                                </div>
                                <h2>'''+jsonData["sub_h2"]+'''
                                </h2>
                                <nav class="sub_nav">
                                    <ol id="list_tree" class="no_draggable ui-sortable ui-sortable-disabled">'''

                                sub = ''

                                if jsonData["pos"] == 'sub':
                                    sub = 'sub_' + d.split('.')[0]
                                else:
                                    sub = 'sub_' + jsonData["parent"]

                                for side in sideMenus:
                                    if sub == side.parent:
                                        html += '''
                                        <li>
                                            <div class="label public">
                                                <a class="courselink" href="'''+URL+'/'+side.name+'">'+side.menu_title+'''
                                                </a>
                                            </div>
                                        </li>'''

                                html += '''
                                    </ol>
                                </nav>
                            </div>
                        </aside>'''

                            now = time.gmtime(time.time())
                            html += '''
                        <div class="entry_area">
                            <article class="hentry">
                                <hgroup>
                                    <h1 class="entry-title">'''+jsonData["article_title"]+'''
                                    </h1>
                                    <div class="props">
                                        <time datetime="" pubdate="">'''+str(now.tm_year)+'년 '+str(now.tm_mon)+'월 '+str(now.tm_mday)+'일 '+str(now.tm_hour)+':'+str(now.tm_min)+':'+str(now.tm_sec)+'''
                                        </time>
                                    </div>
                                </hgroup>

                                <div id="content" class="entry-content">'''
                            
                            with io.open(articleFile,"r", encoding="utf-8") as articleOpen:
                                html += articleOpen.read()

                            html += '''
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </div> <!-- body -->
        </div> <!-- whole_wrapper -->
    </body>
</html>'''

                            textFile.write(html)
                            print("--->" + HTMLFile)

# 
# 
# 

def applyHTMLToApp(dir):
    with io.open(dir + '/app.js',"w", encoding="utf-8") as appOpen:
        data = '''

// Main'''

        for main in mainMenus:
            data += '''
app.get("/" + encodeURIComponent("'''+main.name+'''"), (req, res) => HTMLLoaderInst.assembleHTML(res, "'''+URLSourcePathBase+'/'+main.path+'", "'+main.name+'"))'

        appOpen.write(data)
        print(dir + '/app.js')

# 
# 
# 

mkdirOnPath(HTMLPathBase)

jsonToHTMLHeader(jsonPathBase, HTMLPathBase)

applyHTMLToApp(appPathBase)