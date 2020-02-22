module.exports = HTMLLoader

const PORT = "http://localhost:5000"

// HTMLLoader manages the ways of loading html files.
function HTMLLoader() {
  this.fs = require('fs')
  this.pt = require('path')
  this.autocomplete = this.fs.readFileSync("metadata/script_autocomplete.js", 'utf8')
  this.cytoscape = this.fs.readFileSync("metadata/script_cytoscape.js", 'utf8')

  // find a static page and send
  this.assembleHTML = function(res, dir, page) {
    // console.log('requested page : ' + page)

    var _dir = 'public/html'
    if (dir !== "")
      _dir += '/' + dir

    fs = this.fs
    autocomplete = this.autocomplete

    fs.readFile("metadata/HTMLTemplate.json", 'utf8', function(err, json) {
      var _json = JSON.parse(json)
      
      function findMetadata(json, page) {
        if (json[page])
          return json[page]

        json["menu"].forEach(function (item){
          if (item["file"] === page)
            return item
        })

        return false
      }

      metadata = findMetadata(_json, page)

      if (metadata) {
        fs.readFile(_dir+'/'+page+'.html', 'utf8', function(err, html){

          var template = `
<!doctype html>
<html>
  <head>
      `
          template += `
    <title>${metadata["title"]}</title>
    <meta charset="utf-8">`

          _json["src"].forEach(function (src){
            template += `
    <script src="${src}"></script>`
          })
          _json["link"].forEach(function (link){
            template += `
    <link rel="stylesheet" type="text/css" href="${link}">`
          })
          template +=`
  </head>
  <body id="index" class="no_sidebar">
    <div id="whole_wrapper">
        <div class="head">
            <header>
                <hgroup>
                    <p class="title"><a href="${PORT}">SensebeDictionary</a></p>
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
                            <ul class="sub_nav">
                                <li>
                                    <!--<li class="selected">-->
                                    <div class="label public">
                                        <a class="pagelink" href="${PORT}/main_toddler">첫걸음</a>
                                    </div>
                                    <div class="sub_nav depth_1" style="left: -51px; position: absolute; width: 199px; display: none;" loaded="true">
                                        <ul class="sub_nav">
                                        </ul>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </hgroup> <!-- hgroup -->
            </header>
        </div> <!-- head -->
        <script>
          ${autocomplete}
        </script>
        <div id="body">
        <div id="cols">
          <div class="wrapper">
            <div class="entry_area">`

          template += html

          template += `
            </div>
          </div>
        </div>
      </div> <!-- body -->
    </div> <!-- whole_wrapper -->
  </body>
</html>
          `

          res.send(template)
        })
      } else {
        res.status(404)
        HTMLLoaderInst.assembleHTML(res, '', 'home')
        console.log("something wrong! page : " + page)
      }
    })
  }

  //
  //  search
  //
  this.assembleSearchResultHTML = function(res, searchTarget, searchRes, metaData) {
    cytoscape = this.cytoscape
    autocomplete = this.autocomplete
    this.fs.readFile('public/html/search.html', 'utf8', function(err, head){
      var HTML=head;

      const resTotalCount = searchRes.resultTotalCount;
      const resList = searchRes.resObjList;
      const styleBegin = `<b style="-webkit-text-decoration: underline double #ff2200; text-decoration: underline wavy #ff5500">`;
      const styleEnd = `</b>`;
  
      // results summary (head)
      var search_result = `<div class="result_summary">
                    <span>${styleBegin}${searchTarget}${styleEnd} total result(s) : ${resTotalCount} matches of ${resList.length} contents</span>
                    <span id="filterButton">Filter</span>
                  </div></br>`;
  
      var blockCount = 0;
  
      // results list
      for (var item in resList) {
        //div header
        search_result += `<div class="result_block">`;
        //span Header
        search_result += `<div class="res_block_H" id="${blockCount}">
                <span class="minimizeButton" id="minimizeButton_${blockCount}">-</span>
                < ${resList[item].title} >, ${resList[item].category},
                ${resList[item].language}, result(s) : ${resList[item].resList.length}
                </div>`;
        //div Body
        search_result += `<div class="res_block_B" id="res_block_B${blockCount}"><ol>`;
        for (var _item in resList[item].resList) {
          var sentence = resList[item].resList[_item];
          var index = 0;
  
          // search target through contents from start to very end
          while (1) {
            index = sentence.toLowerCase().indexOf(searchTarget.toLowerCase(), index);
            // very end
            if (index === -1) {
              break;
            } else {
              sentence = sentence.slice(0, index)
                        + styleBegin
                        + sentence.slice(index, index+searchTarget.length)
                        + styleEnd
                        + sentence.slice(index+searchTarget.length);
              index += styleBegin.length + searchTarget.length + styleEnd.length;
            }
          }
  
          search_result += `<li>${sentence} </li><br>`;
        }
        //div close
        search_result += `</ol></div></div><br>`;
        ++blockCount;
      }
  
      //
      // aside_filter setting
      //
      var aside_filter = '';
  
      aside_filter += `<div class="filter_list">`;
      // enumerate metaData
      for (const content in metaData) {
        const _content = metaData[content];
        aside_filter += `<div class="filter_item_wrapper">
                <div class="filterBlock" id="${content}">#${content}</div>`;
        for (let i = 0; i < _content.length; ++i) {
          const _noSpace = _content[i].replace(/\s/g, '_');
          aside_filter += `<div class="filterTriggerButton" id="${_noSpace}" target="${content}">< ${_content[i]} ></div>`;
        }
        aside_filter += `</div><br>`
      }
      //div close
      aside_filter += `</div><br>`;
  
      HTML += `
                  <aside>
                      <div id="list_index" class="index">
                              <div class="cover selected">
                                  <h2 style="text-align: center">필터</h2>
                              </div>
                          <h2>검색 대상</h2>
  
                          <nav class="sub_nav">
                              <ol id="list_tree" class="no_draggable ui-sortable ui-sortable-disabled">
                                  ${aside_filter}
                              </ol>
                          </nav>
                      </div>
                  </aside>
              </div>
              <div class="wrapper">
                  <div class="entry_area">
                    <article class="hentry">
                      <div id="content" class="entry-content">    
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
                                -moz-box-shadow:inset 0 0 10px #666;
                                -webkit-box-shadow:0 0 10px #666;
                                -o-box-shadow:inset 0 0 10px #666;
                                box-shadow:0 0 10px #666
                            }
                        </style>

                        <!--<h1 class="entry-title"></h1>-->
                        <div id="cy"></div>
                        
                      </div>
                      </article>
                      <div class="result_list" style="color:#FFFFFF; font-size:22px">
                          <!-- body - cols - wrapper - entry_area - result_list -->
                          ${search_result}
                      </div>
                  </div>
              </div>
          </div>
  
      </div> <!-- body -->
      <script text="javascript">
        fetch("${PORT}/cy?target=${searchTarget}").then(response => response.json().then(json => {
          var data = json.data
          var root = json.root

          cy.add([{group: 'nodes', data : { id: root, label: root }, classes: "root" } ])
          
          data.forEach(function (item){
            fetch("${PORT}/video?target="+item["_video"]).then(response => response.json().then(videoJson => {
              let div = document.createElement('div');
              div.setAttribute("class","hidden");
              div.setAttribute("id",item['_usage']);
              div.innerHTML = '<div class="video" style="text-align:center; color:#ffa07a;font-size:1.2em">'
              div.innerHTML += '  <iframe width=1280px height=640px src=https://www.youtube.com/embed/'+videoJson["link"]+'></iframe>'
              div.innerHTML += '  <div class="caption"><h3 style="text-align:center;font-size:1.6em;font-weight:bold;color:salmon;border-bottom:1px dotted #fff;padding-bottom:.2em">&lt; '+ videoJson["source"] +' &gt;</h3>'
              videoJson["text"].forEach(function(elm) {
                div.innerHTML += '<span style="font-size:1.4em;font-weight:500;color:#cfc;font-style:italic">' + elm + '</span><br>'
              })
              div.innerHTML += '</div></div>'
              document.getElementById('content').appendChild(div);
              cy.add([{group: 'nodes', data : { id: item['_usage'], label : item['_usage'] }, classes: "usage usage_node_"+ item["_speech"] } ])
              cy.add([{group: 'edges', data : { source: root, target : item['_usage'] }, classes: "edge edge_"+ item["_speech"] } ])
              chunks = data["_chunks"]
              if (chunks !== undefined)
                chunks.forEach(function (chunk) {
                  const id = item['_usage']+"_"+chunk
                  cy.add([{group: 'nodes', data : { id: id, label : chunk }, classes: chunk } ])
                  cy.add([{group: 'edges', data : { source: id, target : root }, classes: "edge" } ])
                })
              
              var options = {
                name: 'cose-bilkent',
                ready: function (e) {
                    var cy = e.cy;
                    cy.nodes().forEach(function(node){
                        if (node.classes()[0] === "number" || node.classes()[0] === "usage") makePopper(node)
                        node._styleOrigin = node.style()
                    })
                },
                stop: function (e) {
                    var cy = e.cy;
                    cy._zoomOrigin = cy.zoom()
                    cy._panOrigin = { 'x':cy.pan()['x'], 'y':cy.pan()['y'] }
                },
                quality: 'default',
                nodeDimensionsIncludeLabels: true,
                refresh: 30,
                fit: true,
                padding: 10,
                randomize: true,
                nodeRepulsion: 4500,
                idealEdgeLength: 3,
                edgeElasticity: 0.1,
                nestingFactor: 0.1,
                gravity: 0.25,
                numIter: 2500,
                tile: true,
                animate: 'end',
                animationDuration: 1000,
                tilingPaddingVertical: 6,
                tilingPaddingHorizontal: 6,
                gravityRangeCompound: 1.5,
                gravityCompound: 1.0,
                gravityRange: 3.8,
                initialEnergyOnIncremental: 0.5
              }
              cy.layout(options).run()
            }))
          })
        }))

        ${cytoscape}
      </script>

      <script>
        ${autocomplete}
      </script>
  
  </div> <!-- whole_wrapper -->
  
  </body>
  </html>`
      
      res.send(HTML)
    })
  }
}
