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
imagePathBase= "/Users/hoon-ilsong/project/koreng/public/image"

mainMenus=[]
subMenus=[]
sideMenus=[]

images=[]

OVERWRITE =True

def setImage(path):
    lst = sorted(os.listdir(path))
    for d in lst:
        fileExtension=d.split(".")[-1]
        if fileExtension == "png" or fileExtension == "jpg":
            print(d)
            images.append(d)

def setMenu(path):
    lst = sorted(os.listdir(path))
    for d in lst:
        # main menu folders
        if os.path.isdir(path + "/" + d):
            mainPath = path + "/" + d
            for d in os.listdir(mainPath):
                if os.path.isdir(mainPath + "/" + d):
                    subPath = mainPath + "/" + d
                    for d in os.listdir(subPath):
                        if os.path.isdir(subPath + "/" + d):
                            sidePath = subPath + "/" + d
                            for d in os.listdir(sidePath):
                                fileExtension=d.split(".")[-1]
                                if fileExtension =="json":
                                    # side menu json
                                    jsonFile = sidePath + "/" + d 
                                    # print('side : '+jsonFile)
                                    with io.open(jsonFile,"r", encoding="utf-8") as jsonOpen:
                                        jsonData = json.load(jsonOpen)
                                        if jsonData['menu_title'] == '':
                                            jsonData['menu_title'] = d.split(".")[0]
                                        sideMenus.append(Menu("sub_"+sidePath.split("/")[-2],"side_"+d.split(".")[0], jsonData["menu_title"], jsonFile.split("/")[-4]+'/'+jsonFile.split("/")[-3]+'/'+jsonFile.split("/")[-2], jsonData["category"]))
                        else:
                            fileExtension=d.split(".")[-1]
                            if fileExtension =="json":
                                # sub menu json
                                jsonFile = subPath + "/" + d 
                                # print('sub : '+jsonFile)
                                with io.open(jsonFile,"r", encoding="utf-8") as jsonOpen:
                                    jsonData = json.load(jsonOpen)
                                    subMenus.append(Menu("main_"+subPath.split("/")[-2],"sub_"+d.split(".")[0], jsonData["menu_title"], jsonFile.split("/")[-3]+'/'+jsonFile.split("/")[-2], jsonData["category"]))
                else:
                    fileExtension=d.split(".")[-1]
                    if fileExtension =="json":
                        # main menu json
                        jsonFile = mainPath + "/" + d 
                        # print('main : '+jsonFile)
                        with io.open(jsonFile,"r", encoding="utf-8") as jsonOpen:
                            jsonData = json.load(jsonOpen)
                            mainMenus.append(Menu("","main_"+d.split(".")[0], jsonData["menu_title"],jsonFile.split("/")[-2], jsonData["category"]))
                        
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

                        startIndex = 0
                        endIndex = jsonFile.find('/html_metadata')
                        root="".join((jsonFile[:startIndex],'',jsonFile[endIndex:]))
                        # print("".join(("root : ",root)))
                        
                        # parent
                        parent = jsonFile.split('/')[-3]
                        # print('parent : ' + parent)
                        # pos
                        pos = jsonData['pos']
                        if d.split(".")[0] == 'search' and parent == 'public':
                            pos = 'search'
                        elif len(root.split('/')) == 3:
                            pos = 'home'
                        elif len(root.split('/')) == 4:
                            pos = 'main'
                        elif len(root.split('/')) == 5:
                            pos = 'sub'
                        elif len(root.split('/')) == 6:
                            pos = 'side'

                        # print('pos : ' + pos)
                        
                        # parent's sub_title, sub_h2
                        title = jsonData['title']
                        sub_title = jsonData['sub_title']
                        sub_h2 = jsonData['sub_h2']
                        if pos == 'side':
                            startIndex = 0
                            endIndex = jsonFile.rfind('/'+parent+'/')
                            parentPath = "".join((jsonFile[:endIndex], '/', parent, '/', parent, '.json'))

                            with io.open(parentPath,"r", encoding="utf-8") as parentOpen:
                                parentData = json.load(parentOpen)
                                title = parentData["title"]
                                sub_title = parentData["sub_title"]
                                sub_h2 = parentData["sub_h2"]

                        # print("".join(("sub_title : ",sub_title,' sub_h2 : ', sub_h2)))

                        # article_title
                        article_title = jsonData['article_title']
                        if (pos == 'side' or pos == 'sub'):
                            _name = d.split(".")[0]
                            article_title = "".join((_name[0].upper(),_name[1:]))

                        # print("".join(("article_title : ",article_title)))

                        if jsonData['title'] == '':
                            jsonData['title'] = "".join((d.split(".")[0]," - ",title))
                        elif pos == 'sub':
                            jsonData['title'] = "".join((d.split(".")[0]," - ",jsonData['title']))
                        # if jsonData['menu_title'] == '':
                        #     jsonData['menu_title'] = d.split(".")[0]
                        if jsonData['article_title'] == '':
                            jsonData['article_title'] = article_title

                        jsonData['pos'] = pos
                        jsonData['parent'] = parent
                        jsonData['sub_title'] = sub_title
                        jsonData['sub_h2'] = sub_h2


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
        <script src="./js/search.js"></script>
        <script src="./js/general.js"></script>
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
                                    <div class="item_input">
                                        <div class="input_border">
                                            <input class="search_input" name="target" maxlength="2048" type="text" aria-autocomplete="both" aria-haspopup="false" autocapitalize="off" autocomplete="off" autocorrect="off" role="combobox" spellcheck="false" title="검색" value="" placeholder="ex)take" aria-label="검색">
                                        </div>
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
// expres
const express = require('express')
const app = express()

// third-party
const compression = require('compression')
const bodyParser = require('body-parser')
const helmet = require('helmet')

// built-in
const fs = require('fs')

// custom
const HTMLLoader = require('./feature/HTMLLoader.js')
const HTMLLoaderInst = new HTMLLoader()
const dataLoader = require('./feature/dataLoader.js')
const dataLoaderInst = new dataLoader()
const mongoClient = require('./feature/mongoClient.js')
const mongoClientInst = new mongoClient()

// heroku
const PORT = process.env.PORT || 5000

// middlewares
app.use(express.static('public'))
app.use(helmet())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}))
app.use(compression())

// Home
app.get('/', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html','home'))

// Search
app.get('/search', (req, res) => onSearch(req, res))

// Main'''

        for main in mainMenus:
            data += '''
app.get("/" + encodeURIComponent("'''+main.name+'''"), (req, res) => HTMLLoaderInst.assembleHTML(res, "'''+URLSourcePathBase+'/'+main.path+'", "'+main.name+'"))'

        data +='''

// Sub'''

        for sub in subMenus:
            data += '''
app.get("/" + encodeURIComponent("'''+sub.name+'''"), (req, res) => HTMLLoaderInst.assembleHTML(res, "'''+URLSourcePathBase+'/'+sub.path+'", "'+sub.name+'"))'

        data +='''

// Side'''

        for side in sideMenus:
            data += '''
app.get("/" + encodeURIComponent("'''+side.name+'''"), (req, res) => HTMLLoaderInst.assembleHTML(res, "'''+URLSourcePathBase+'/'+side.path+'", "'+side.name+'"))'

        data += '''

// image'''
        for image in images:
            data += '''
app.get("/'''+image+'''", (req, res) => res.sendFile("/public/image/'''+image+'''", { root : __dirname}))'''

        data += '''

// app.post('/filter_process', (req, res) => res.send(onSearchWithFilter(req, res)))
// app.get('/filter', (req, res) => res.send(HTMLLoaderInst.resultHandlingForFilter(dataLoaderInst.metaData)))

app.use(function(req, res, next) {
    res.status(404)
    HTMLLoaderInst.assembleHTML(res, 'public/html', 'home')
    console.log("something wrong! req.url : " + req.url)
});

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

try {
    app.listen(PORT, () => console.log(`agjac on port ${PORT}!`))
} catch (e) {
    console.error(e)
} finally {
    mongoClientInst.close()
}

//
// functions
//
async function onSearch(req, res) {
    function arrayRemove(arr, value) {
        return arr.filter(function(ele) {
        return ele != value;
        });
    }
    
    const searchTarget = req.query.target

    // let [foo, bar] = await Promise.all([getFoor(), getBar()]);
    // mongoRes = mongoClientInst.findOneListingById(searchTarget)
    //             .then(function(v){
    //                     console.log('success!', v)
    //                 },
    //                 function(v){
    //                     console.log('failure', v)
    //                 }
    //             )
    // console.log('mongoRes : ',mongoRes)

    let mongoRes = await mongoClientInst.findOneListingById(searchTarget)
    
    if (mongoRes) {
        searchRes = dataLoaderInst.searchData(searchTarget, '', '');

        return HTMLLoaderInst.assembleSearchResultHTML(res, searchTarget, mongoRes, searchRes, dataLoaderInst.metaData);

    } else {
        return HTMLLoaderInst.assembleHTML(res, 'public/html', 'home');
    }
    // const filterCategory = arrayRemove(req.query.filterCategory.replace(/';;'/g, ';').split(';'), '')
    // const filterContents = arrayRemove(req.query.filterContents.replace(/';;'/g, ';').split(';'), '')

    // nothing to search
    // if (searchTarget === undefined || searchTarget.length === 0 || searchTarget.replace(/\s/g, '') === '') {
    //     return HTMLLoaderInst.assembleHTML(res, 'public/html', 'home');
    // // something to search
    // } else {
    //     // const result = dataLoaderInst.searchData(searchTarget, filterCategory, filterContents);
        // result = dataLoaderInst.searchData(searchTarget, '', '');

        // // const resultTotalCount = result.resultTotalCount;

        // return HTMLLoaderInst.assembleSearchResultHTML(res, searchTarget, result, dataLoaderInst.metaData);
    // }
}'''

        appOpen.write(data)
        print(dir + '/app.js')

# 
# 
# 

mkdirOnPath(HTMLPathBase)

setImage(imagePathBase)

# load json contents onto memory 
setMenu(jsonPathBase)

jsonToHTMLHeader(jsonPathBase, HTMLPathBase)

applyHTMLToApp(appPathBase)