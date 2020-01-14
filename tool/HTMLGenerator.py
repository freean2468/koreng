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

pageNumber= 0


jsonPathBase= "/Users/hoon-ilsong/project/koreng/public/html_metadata"
HTMLPathBase= "/Users/hoon-ilsong/project/koreng/public/html"
appPathBase= "/Users/hoon-ilsong/project/koreng"
URLSourcePathBase= "public/html"

mainMenus=[]
subMenus=[]
sideMenus=[]

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
                                if fileExtension =="json" and d.split("_")[-1] != "cy.json":
                                    # side menu json
                                    jsonFile = sidePath + "/" + d 
                                    # print('side : '+jsonFile)
                                    with io.open(jsonFile,"r", encoding="utf-8") as jsonOpen:
                                        jsonData = json.load(jsonOpen)
                                        sideMenus.append(Menu("sub_"+sidePath.split("/")[-2],"side_"+d.split(".")[0], jsonData["menu_title"], jsonFile.split("/")[-4]+'/'+jsonFile.split("/")[-3]+'/'+jsonFile.split("/")[-2], jsonData["category"]))
                        else:
                            fileExtension=d.split(".")[-1]
                            if fileExtension =="json" and d.split("_")[-1] != "cy.json":
                                # sub menu json
                                jsonFile = subPath + "/" + d 
                                # print('sub : '+jsonFile)
                                with io.open(jsonFile,"r", encoding="utf-8") as jsonOpen:
                                    jsonData = json.load(jsonOpen)
                                    subMenus.append(Menu("main_"+subPath.split("/")[-2],"sub_"+d.split(".")[0], jsonData["menu_title"], jsonFile.split("/")[-3]+'/'+jsonFile.split("/")[-2], jsonData["category"]))
                else:
                    fileExtension=d.split(".")[-1]
                    if fileExtension =="json" and d.split("_")[-1] != "cy.json":
                        # main menu json
                        jsonFile = mainPath + "/" + d 
                        # print('main : '+jsonFile)
                        with io.open(jsonFile,"r", encoding="utf-8") as jsonOpen:
                            jsonData = json.load(jsonOpen)
                            mainMenus.append(Menu("","main_"+d.split(".")[0], jsonData["menu_title"],jsonFile.split("/")[-2], jsonData["category"]))
                        
def mkdirOnPath(path):
    if not os.path.isdir(path):
        os.mkdir(path)

def jsonToHTML(jsonPath, HTMLPath):
    for d in os.listdir(jsonPath):
        if os.path.isdir(jsonPath + "/" + d):
            mkdirOnPath(HTMLPath + "/" + d)
            jsonToHTML(jsonPath + "/" + d, HTMLPath + "/" + d)
        else:
            fileExtension=d.split(".")[-1]
            if fileExtension =="json" and d.split("_")[-1] != "cy.json":
                jsonFile = jsonPath + "/" + d
                articleFile = jsonPath + "/" + d.split(".")[0] + ".html"
                HTMLFile = HTMLPath + "/" + d.split(".")[0] + ".html"
                if 1:# if not os.path.isfile(HTMLFile):
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
        <script src="https://cdn.jsdelivr.net/npm/js-cookie@beta/dist/js.cookie.min.js"></script>'''
                            if jsonData["category"] == "cy":
                                html += '''
        <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.9.4/cytoscape.min.js"></script>'''
                            html +='''
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
                                html += '''<li>
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
        app.get('/', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html','home'))'''

        for main in mainMenus:
            data += '''
        app.get("/'''+main.name+'''", (req, res) => HTMLLoaderInst.assembleHTML(res, "'''+URLSourcePathBase+'/'+main.path+'", "'+main.name+'"))'

        for sub in subMenus:
            data += '''
        app.get("/'''+sub.name+'''", (req, res) => HTMLLoaderInst.assembleHTML(res, "'''+URLSourcePathBase+'/'+sub.path+'", "'+sub.name+'"))'
            if sub.category == 'cy':
                data += '''
        app.get("/'''+sub.name+'''_cy", (req, res) => HTMLLoaderInst.assembleHTML(res, "'''+URLSourcePathBase+'/'+sub.path+'", "'+sub.name+'_cy"))'

        for side in sideMenus:
            data += '''
        app.get("/'''+side.name+'''", (req, res) => HTMLLoaderInst.assembleHTML(res, "'''+URLSourcePathBase+'/'+side.path+'", "'+side.name+'"))'

        data += '''
        // Search
        app.get('/search', (req, res) => onSearch(req, res))

        // app.post('/filter_process', (req, res) => res.send(onSearchWithFilter(req, res)))
        // app.get('/filter', (req, res) => res.send(HTMLLoaderInst.resultHandlingForFilter(dataLoaderInst.metaData)))

        app.use(function(req, res, next) {
            res.status(404)
            HTMLLoaderInst.assembleHTML(res, 'public/html', 'home')
            console.log("something wrong!")
        });
        
        app.use(function (err, req, res, next) {
            console.error(err.stack)
            res.status(500).send('Something broke!')
        });

        app.listen(PORT, () => console.log(`agjac on port ${PORT}!`))

        //
        // functions
        //
        function onSearch(req, res) {
            function arrayRemove(arr, value) {
                return arr.filter(function(ele) {
                return ele != value;
                });
            }
            
            const searchTarget = req.query.target

            // const filterCategory = arrayRemove(req.query.filterCategory.replace(/';;'/g, ';').split(';'), '')
            // const filterContents = arrayRemove(req.query.filterContents.replace(/';;'/g, ';').split(';'), '')

            // nothing to search
            if (searchTarget === undefined || searchTarget.length === 0 || searchTarget.replace(/\s/g, '') === '') {
                return HTMLLoaderInst.assembleHTML(res, 'public/html', 'home');
            // something to search
            } else {
                // const result = dataLoaderInst.searchData(searchTarget, filterCategory, filterContents);
                const result = dataLoaderInst.searchData(searchTarget, '', '');

                // const resultTotalCount = result.resultTotalCount;

                return HTMLLoaderInst.assembleSearchResultHTML(res, searchTarget, result, dataLoaderInst.metaData);
            }
        }'''

        appOpen.write(data)
        print(dir + '/app.js')

def jsonToCyHTML(jsonPath, HTMLPath):
    for d in os.listdir(jsonPath):
        if os.path.isdir(jsonPath + "/" + d):
            jsonToCyHTML(jsonPath + "/" + d, HTMLPath + "/" + d)
        else:
            fileExtension=d.split("_")[-1]
            if fileExtension =="cy.json":
                jsonFile = jsonPath + "/" + d
                HTMLFile = HTMLPath + "/" + d.split(".")[0] + ".html"
                if 1:# if not os.path.isfile(HTMLFile):
                    print("from : "+jsonFile)
                    with io.open(jsonFile,"r", encoding="utf-8") as jsonOpen:
                        jsonData = json.load(jsonOpen)

                        with io.open(HTMLFile,"w", encoding="utf-8") as textFile:
                            # "/Users/hoon-ilsong/project/koreng/public/html_metadata/4_verbmap/change/change_cy.json"
                            urlBasePath = jsonFile.replace('/Users/hoon-ilsong/project/koreng/public/html_metadata/', URLSourcePathBase+'/')
                            html = '''
<!DOCTYPE html>
    <html>
    <head>
    <meta charset=utf-8 />
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, minimal-ui">
    <title>'''+d.split(".")[0]+' - Agjak'+'''
    </title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.9.4/cytoscape.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <style>
        body { 
            font: 14px helvetica neue, helvetica, arial, sans-serif;
            margin: 0
        }
    
        #cy {
            height: 100%;
            width: 100%;
            display: block;
            position: relative;
        }
    </style>
    </head>
    <body style="margin:0;width:100vw;height:100vh">
        <div id="cy"></div>
        <!-- Load application code at the end to ensure DOM is loaded -->
        <script text="javascript">
            var cy = cytoscape({
                container: document.getElementById('cy'),
                elements: {
                    nodes: ['''
                            for node in jsonData["nodes"]:
                                data = node["data"]
                                html += '''
                        { data : { id: "''' + data["id"] + '", name: "' + data["name"] + '", href: "' + data["href"] + '" } }'
                                if node != jsonData["nodes"][-1]:
                                    html += ','
                            
                            html += '''
                    ],
                    edges: ['''
                            for edge in jsonData["edges"]:
                                data = edge["data"]
                                html += '''
                        { data : { source: "''' + data["source"] + '", target: "' + data["target"] + '" } }'
                                if edge != jsonData["edges"][-1]:
                                    html += ','
                            
                            html += '''
                    ]
                },'''

                            html +='''
                style: [
                    {
                        selector: 'node',
                        style: {
                            'content': 'data(name)',
                            'text-valign': 'center',
                            'text-outline-width': 1,
                            'color': 'white',
                            'text-outline-color': '#000',
                            'background-color': '#000'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'width': 1,
                            'curve-style': 'straight',
                            'line-color': '#aaa',
                            'target-arrow-color': '#ccc',
                            'target-arrow-shape': 'vee',
                            'target-arrow-fill': 'hollow'
                        }
                    }
                ],
                layout: {
                    name: 'cose',

                    // Called on 'layoutready'
                    ready: function(){},

                    // Called on 'layoutstop'
                    stop: function(){},

                    // Whether to animate while running the layout
                    // true : Animate continuously as the layout is running
                    // false : Just show the end result
                    // 'end' : Animate with the end result, from the initial positions to the end positions
                    animate: true,

                    // Easing of the animation for animate:'end'
                    animationEasing: undefined,

                    // The duration of the animation for animate:'end'
                    animationDuration: undefined,

                    // A function that determines whether the node should be animated
                    // All nodes animated by default on animate enabled
                    // Non-animated nodes are positioned immediately when the layout starts
                    animateFilter: function ( node, i ){ return true; },


                    // The layout animates only after this many milliseconds for animate:true
                    // (prevents flashing on fast runs)
                    animationThreshold: 250,

                    // Number of iterations between consecutive screen positions update
                    refresh: 20,

                    // Whether to fit the network view after when done
                    fit: true,

                    // Padding on fit
                    padding: 30,

                    // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
                    boundingBox: undefined,

                    // Excludes the label when calculating node bounding boxes for the layout algorithm
                    nodeDimensionsIncludeLabels: false,

                    // Randomize the initial positions of the nodes (true) or use existing positions (false)
                    randomize: false,

                    // Extra spacing between components in non-compound graphs
                    componentSpacing: 40,

                    // Node repulsion (non overlapping) multiplier
                    nodeRepulsion: function( node ){ return 2048; },

                    // Node repulsion (overlapping) multiplier
                    nodeOverlap: 4,

                    // Ideal edge (non nested) length
                    idealEdgeLength: function( edge ){ return 32; },

                    // Divisor to compute edge forces
                    edgeElasticity: function( edge ){ return 32; },

                    // Nesting factor (multiplier) to compute ideal edge length for nested edges
                    nestingFactor: 1.2,

                    // Gravity force (constant)
                    gravity: 1,

                    // Maximum number of iterations to perform
                    numIter: 1000,

                    // Initial temperature (maximum node displacement)
                    initialTemp: 1000,

                    // Cooling factor (how the temperature is reduced between consecutive iterations
                    coolingFactor: 0.99,

                    // Lower temperature threshold (below this point the layout will end)
                    minTemp: 1.0
                }
            });

            cy.on('tap', 'node', function(){
                try { // your browser may block popups
                    window.open( this.data('href') );
                } catch(e){ // fall back on url change
                    window.location.href = this.data('href');
                }
            })

            // set focus on the node of the page
            var parent = window.parent ? window.parent.location.pathname : "'''+d.split(".")[0].split('_')[0]+'''"
            
            parent = parent.replace('/sub_', '')
            parent = parent.replace('/side_', '')
            parent = parent.replace(/-/g, ' ')

            cy.nodes().forEach(function(node){
                if(node.id() === parent){
                    node.style('background-color', '#fbfb11')
                }
            })

            cy.edges().forEach(function(edge){
                if(edge.source().id() === parent) {
                    edge.style('width', '2')
                    edge.style('line-color', '#fbfb11')
                    edge.style('target-arrow-color', '#fdfd11')
                    edge.style('target-arrow-fill', 'filled')
                }
            })
        </script>
    </body>
</html>'''
                                
                            textFile.write(html)
                            print("--->" + HTMLFile)


mkdirOnPath(HTMLPathBase)

setMenu(jsonPathBase)

jsonToHTML(jsonPathBase, HTMLPathBase)

jsonToCyHTML(jsonPathBase, HTMLPathBase)

applyHTMLToApp(appPathBase)