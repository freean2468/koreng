module.exports = HTMLLoader

// HTMLLoader manages the ways of loading html files.
function HTMLLoader() {
  this.fs = require('fs')
  this.pt = require('path')

  // find a page and send
  this.assembleHTML = function(res, dir, page) {
    // console.log('requested page : ' + page)
    // console.log('page path : ' + dir+'/'+page.replace(page.split('_')[0]+'_','')+'.html')

    this.fs.readFile(dir+'/'+page.replace(page.split('_')[0]+'_','')+'.html', 'utf8', function(err, html){
      res.send(html)
    })
  }

  //
  //  search
  //
  this.assembleSearchResultHTML = function(res, searchTarget, mongoRes, searchRes, metaData) {
    this.fs.readFile('public/html/search.html', 'utf8', function(err, head){
      var HTML=head;
      var speech = []

      // mongoRes["_data"].forEach(function (_data) {
      //   _data["__speech"] = _data["__speech"].replace(/\s/g,"_")
      // })

      /* Generate Cy Data */
      var CyScript= `
      <script text="javascript">
            var cy = cytoscape({
                container: document.getElementById('cy'),
                elements: {
                    nodes: [
                      { data : { id: "${mongoRes['_wordset']}", label : "${mongoRes['_wordset']}" }, classes: "wordset" }`
      idx = 0
      mongoRes["_data"].forEach(function (_data) {
        __speech = _data["__speech"]
        idx++
        if (__speech === "")
          __speech = "usage"
        
        CyScript += `
                      ,{ data : { id: "_${__speech}_${idx}", label: "${__speech}"}, classes: "speech speech_node_${__speech}"}`
        speech.push(__speech)
          
        __usageNumber = 0
        _data["__usage"].forEach(function (__usage) {
          __usageNumber++

          CyScript += `
                      ,{ data : { id: "${__speech}_${idx}_${__usageNumber}", label: "${__usageNumber}."}, classes: "number number_node_${__speech}" }`
          __usage["___meaningPiece"].forEach(function(___meaningPiece){
            if ("" !== ___meaningPiece)
              CyScript += `
                      ,{ data : { id: "${__speech}_${idx}_${__usageNumber}_${___meaningPiece}", label: "${___meaningPiece}", parent: "${__speech}_${idx}_${__usageNumber}"}, classes: "meaning"  }`
          })

          if (__usage["___synonym"][0] !== "")
            CyScript += `
                      ,{ data : { id: "${__speech}_${idx}_${__usageNumber}_synonym", label: "synonym", parent: "${__speech}_${idx}_${__usageNumber}"}, classes: "synonym" }`
          __usage["___synonym"].forEach(function(___synonym){
            if ("" !== ___synonym) {
              CyScript += `
                      ,{ data : { id: "${__speech}_${idx}_${__usageNumber}_${___synonym}", label: "${___synonym}", parent: "${__speech}_${idx}_${__usageNumber}_synonym"}, classes: "synonyms" }`
            }
          })

          if (__usage["___not"][0] !== "")
            CyScript += `
                      ,{ data : { id: "${__speech}_${idx}_${__usageNumber}_not", label: "not" }, parent: "${__speech}_${idx}_${__usageNumber}"}, classes: "not" }`
          __usage["___not"].forEach(function(___not){
            if ("" !== ___not)
              CyScript += `
                      ,{ data : { id: "${__speech}_${idx}_${__usageNumber}_${___not}", label: "${___not}"}, parent: "${__speech}_${idx}_${__usageNumber}_not"}, classes: "nots" }`
          })
        })
      })
          
      CyScript += `
                    ],
                    edges: [`

      index=0
      speech.forEach(function (_speech, idx, array) {
        index++
        CyScript += `
                      { data : { source: "${mongoRes['_wordset']}", target: "_${_speech}_${index}" }, classes: "edge_wordset" }`  
        if (idx !== array.length - 1) CyScript += ','
      })

      idx = 0
      mongoRes["_data"].forEach(function (_data) { 
        __speech = _data["__speech"] 
        if (__speech === "")
          __speech = "usage"

        __usageNumber = 0
        idx++
        _data["__usage"].forEach(function (__usage) {
          __usageNumber++

          CyScript += `
                    ,{ data : { source: "_${__speech}_${idx}", target: "${__speech}_${idx}_${__usageNumber}"}, classes: "edge edge_${__speech}" }`
        })
      })

      CyScript += `
                    ]
                },
                style: [
                  //// initial style
                  {
                      selector: 'node',
                      style: {
                          'content': 'data(label)','height':'label','width':'label',
                          'text-valign': 'center','text-outline-width': 0.8,'font-size': 8,'text-outline-color': '#000','text-wrap':'none','text-max-width':100,
                          'color': 'white','background-color': '#000',
                          'border-width':0,'padding':2,'shape':'round-rectangle','z-compound-depth':'top'
                      }
                  },
                  {
                      selector: ':parent',
                      style: {
                          'text-valign': 'top','text-halign': 'center',
                          'background-color': '#000','border-color':'#aaa',
                          'border-width':1,'border-style':'dotted','padding':2
                      }
                  },
                  {
                      selector: 'edge',
                      style: {
                          'width': 3,'line-color': '#FF0','curve-style': 'unbundled-bezier','arrow-scale': 1.6,'z-index':0,
                          'target-arrow-color': '#FF0','target-arrow-shape': 'vee','target-arrow-fill': 'hollow','target-endpoint':'outside-to-node-or-label',
                          'overlay-opacity': 0
                      }
                  },

                  // general style
                  {selector: '.wordset',style: {'border-color' : '#fbfb11','border-width' : 3,'font-size': 16}},
                  {selector: '.speech',style: {'background-color': '#222','font-size': 12,'border-color':'#fff','border-width':1,'border-opacity':0.9,'border-style':'solid','padding' : 5}},
                  {selector: '.not',style: {'font-size' : 11,'color':'#DC143C'}},
                  {selector: '.synonym',style: {'font-size' : 11,'color':'#00ff7f'}},
                  {selector: '.meaning, .synonyms, .nots',style: {'font-size': 10}},

                  // edge style
                  {selector: '.edge',style: {'width':0.8, 'opacity':0.6, 'arrow-scale': 1.0, 'line-color': 'DarkViolet','target-arrow-color': 'DarkViolet'}},
                  {selector: '.edge_wordset',style: {'width': '2.2', 'line-color': '#fbfb11', 'target-arrow-color': '#fdfd11', 'target-arrow-fill':'filled', 'arrow-scale':1.0}},
                  {selector: '.edge_verb', style: {'line-color': 'Tomato', 'target-arrow-color': 'Tomato'}},
                  {selector: '.edge_noun', style: {'line-color': 'SpringGreen','target-arrow-color': 'SpringGreen'}},
                  {selector: '.edge_adjective', style: {'line-color': 'Turquoise','target-arrow-color': 'Turquoise'}},
                  {selector: '.edge_adverb',style: {'line-color': 'DeepPink','target-arrow-color': 'DeepPink'}},
                  {selector: '.edge_preposition', style: {'line-color': 'Pink','target-arrow-color': 'Pink'}},
                  {selector: '.edge_conjunction',style: {'line-color': 'SlateBlue','target-arrow-color': 'SlateBlue'}},
                  
                  // speech_node style
                  {selector: '.speech',style: {'color': 'DarkViolet'}},
                  {selector: '.speech_node_verb', style: {'color': 'Tomato'}},
                  {selector: '.speech_node_noun', style: {'color': 'SpringGreen'}},
                  {selector: '.speech_node_adjective', style: {'color': 'Turquoise'}},
                  {selector: '.speech_node_adverb',style: {'color': 'DeepPink'}},
                  {selector: '.speech_node_preposition',style: {'color': 'Pink'}},
                  {selector: '.speech_node_conjunction',style: {'color': 'SlateBlue'}},

                  // number_node style
                  {selector: '.number',style: {'border-color': 'DarkViolet','padding' : 10,'border-width':2, 'background-opacity':0.5}},
                  {selector: '.number_node_verb', style: {'border-color': 'Tomato'}},
                  {selector: '.number_node_noun', style: {'border-color': 'SpringGreen'}},
                  {selector: '.number_node_adjective', style: {'border-color': 'Turquoise'}},
                  {selector: '.number_node_adverb',style: {'border-color': 'DeepPink'}},
                  {selector: '.number_node_preposition',style: {'border-color': 'Pink'}},
                  {selector: '.number_node_conjunction',style: {'border-color': 'SlateBlue'}},

                  // synonym & not style
                  {selector: '.synonym',style: {'color' : 'Chartreuse', 'border-color': 'Chartreuse', 'background-opacity':0.5}},
                  {selector: '.not',style: {'color' : 'Red', 'border-color': 'Red', 'background-opacity':0.5}}
              ],
              layout: {
                  name: 'cose-bilkent',
                  
                  ready: function (e) {
                      var cy = e.cy;
                      cy.nodes().forEach(function(node){
                          if (node.classes()[0] === "number" || node.classes()[0] === "speech") makePopper(node)
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
              },
              // initial viewport state:
              zoom: 1,
              pan: { x: 0, y: 0 },

              // interaction options:
              minZoom: 0.8,
              maxZoom: 2.37,
              zoomingEnabled: true,
              userZoomingEnabled: false,
              panningEnabled: true,
              userPanningEnabled: true,
              boxSelectionEnabled: true,
              selectionType: 'single',
              touchTapThreshold: 8,
              desktopTapThreshold: 4,
              autolock: false,
              autoungrabify: false,
              autounselectify: false,

              // rendering options:
              headless: false,
              styleEnabled: true,
              hideEdgesOnViewport: false,
              textureOnViewport: false,
              motionBlur: false,
              motionBlurOpacity: 0.2,
              wheelSensitivity: 0.1,
              pixelRatio: 'auto'
          })

          function makePopper(node) {
            let ref = node.popperRef(); // used only for positioning

            // unfortunately, a dummy element must be passed as tippy only accepts a dom element as the target
            // https://github.com/atomiks/tippyjs/issues/661
            let dummyDomEle = document.createElement('div');

            let tip = new tippy(dummyDomEle, { // tippy options:
              // mandatory:
              trigger: 'manual', // call show() and hide() yourself
              lazy: false, // needed for onCreate()
              onCreate: instance => { instance.popperInstance.reference = ref; }, // needed for ref positioning

              content: () => {
                let content = document.getElementById(node.data('id'));
                let dummyDomEle = document.createElement('div');

                dummyDomEle.innerHTML = content.innerHTML + '<br>'

                return dummyDomEle;
              },
              // your own preferences:
              appendTo: document.body,
              arrow: true,
              allowHTML: true,
              interactive: true,
              placement: 'auto',
              hideOnClick: false,
              multiple: false,
              sticky: true,
              theme: 'agjak',
              maxWidth: 700,
              distance: 60
            });

            node._trigger = false
            node.tip = tip
          }

          // cy.on('tap', 'node', function(){
          //     try { // your browser may block popups
          //         // window.open( this.data('href') );
          //         console.log(this.data('id') + ' node tapped!')
          //     } catch(e){ // fall back on url change
          //         // window.location.href = this.data('href');
          //     }
          // })

          function flipTrigger(node) {
              ms = 200
              if (node._trigger) {
                  node._trigger = false
                  node.tip.hide()
                  cy.stop()
                  cy.animate({
                    pan: { x: cy._panOrigin['x'], y: cy._panOrigin['y'] },
                    zoom: cy._zoomOrigin
                  }, {
                    duration: ms
                  });
                  node.style(node._styleOrigin)
              } else {
                  node._trigger = true
                  node.tip.show()
                  cy.stop()
                  cy.animate({
                    fit: {
                      eles: node,
                      padding: 20
                    }
                  }, {
                    duration: ms
                  });
              }
          }

          cy.on('tap', function(){
            cy.on('tap', function(event){
              var evtTarget = event.target;
            
              if( evtTarget === cy )
                cy.nodes().forEach(function (node){
                  if (node._trigger === true) 
                    flipTrigger(node)
                })
            });
          })

          cy.on('tap', '.number', function() {
            origin = this
            cy.nodes().forEach(function (node){
              if (node._trigger === true && node !== origin) flipTrigger(node)
            })
            flipTrigger(this) 
          })

          cy.on('tap', '.meaning', function() {
            origin = this.parent()
            cy.nodes().forEach(function (node){
              if (node._trigger === true && node !== origin) flipTrigger(node)
            })
            flipTrigger(this.parent()) 
          })

          cy.on('tap', '.speech', function() {
            origin = this
            cy.nodes().forEach(function (node){
              if (node._trigger === true && node !== origin) flipTrigger(node)
            })
            flipTrigger(this) 
          })

          cy.on('mouseover', '.speech', function() {
            this.style('border-width', 2) 
            $('html,body').css('cursor', 'pointer')
          })

          cy.on('mouseout', '.speech', function() {
            this.style('border-width', 1)
            $('html,body').css('cursor', 'default')
          })

          cy.on('mouseover', '.number', function(){
              this.style('border-style', 'solid')
              this.style('font-size', '12')
              $('html,body').css('cursor', 'pointer');
          })

          cy.on('mouseout', '.number', function(){
            if (this._trigger === false) {
              this.style('border-style', 'dotted')
              this.style('font-size', '8')
            }
            $('html,body').css('cursor', 'default')
          })

          cy.on('mouseover', '.meaning', function(){
              this.style('border-width', 1)
              this.style('border-color', '#fbfb11')
              $('html,body').css('cursor', 'pointer');
          })

          cy.on('mouseout', '.meaning', function(){
              this.style('border-width', 0)
              $('html,body').css('cursor', 'default');
          })

          cy.on('mouseover', '.synonyms', function(){
            this.style('border-width', 1)
            this.style('border-color', '#00ff7f')
          })

          cy.on('mouseout', '.synonyms', function(){
              this.style('border-width', 0)
          })

          cy.on('mouseover', '.nots', function(){
            this.style('border-width', 1)
            this.style('border-color', '#DC143C')
          })

          cy.on('mouseout', '.nots', function(){
              this.style('border-width', 0)
          })
      </script>`


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

                        <!--<h1 class="entry-title">${mongoRes['_wordset']}</h1>-->
                        <div id="cy"></div>
                        `
        speechIndex = 0
        mongoRes['_data'].forEach(function(_data){
          speechIndex++
          speech = _data['__speech']
          if (speech === "") {
            speech = "usage"
          }
          HTML += `
                        <div id="_${speech}_${speechIndex}" class="hidden">
                        <h1 style="border-top:1px solid yellow;font-size:2em;font-weight:bold;color:#fff" class="entry-title">${_data['__represent']}   `
          
          if (_data['__speech'] !== "")
            HTML += `
                        [${speech}]   `

          if (_data["__tense"] !== "")
            HTML += `
                        (${_data["__tense"]})`

          HTML += `
                        </h1>
                        
                        <h3 style="font-size:1.2em;font-weight:bold;color:#fff;border-bottom:1px dotted #fff;padding-bottom:.2em">${_data['__pronounce']}</h3>
                        </div>`
          
          idx=0
          _data['__usage'].forEach(function(__usage){
            ++idx
            HTML += `
                      <div id="${speech}_${speechIndex}_${idx}" class="hidden">
                      <h4 style="font-size:1.4em;font-weight:500;color:#cfc;font-style: italic">${idx}. `

            
            __usage["___extra"].forEach(function(___extra) {
              HTML += `${___extra} `
            })

            HTML += `
                      </h4><span style="font-size:1.2em">${__usage["___meaning"]}</span></br>`

            __usage["___image"].forEach(function(___image) {
              if (___image["____link"] !== "") {
                HTML += `
                      <div class="image" style="text-align:center; color:#ffa07a;font-size:1.2em">
                        <img src="${___image["____link"]}" width=100% alt="${___image["____source"]} : ${_data["__represent"]}" title="${___image["____source"]} : ${_data["__represent"]}">
                        <div class="caption">&lt;${___image["____source"]} : ${_data["__represent"]}&gt;</div>
                      </div>`
              }
            })
            __usage["___video"].forEach(function(___video) {
              if (___video["____link"] !== "") {
                HTML += `
                      <div class="video" style="text-align:center; color:#ffa07a;font-size:1.2em">
                        <iframe width=320px height=180px src=https://www.youtube.com/embed/${___video["____link"]}></iframe>
                        <div class="caption">&lt;${___video["____source"]} : ${_data["__represent"]}&gt;</div>
                      </div>`
              }
            })
            HTML += `</div>`
          })
        })
        HTML += `
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
      ${CyScript}
  
  
  </div> <!-- whole_wrapper -->
  
  </body>
  </html>`
      
      res.send(HTML)
    })
  }
}
