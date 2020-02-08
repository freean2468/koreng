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

      // 0 : Parent-Child, 1 : Edge-Tree
      var viewMethod = 0

      /* Generate Cy Data */
      var CyScript= `
      <script text="javascript">
            var cy = cytoscape({
                container: document.getElementById('cy'),
                elements: {
                    nodes: [
                      { data : { id: "${mongoRes['_wordset']}", label : "${mongoRes['_wordset']}" }, classes: "wordset" }`
      mongoRes["_data"].forEach(function (_data) {
        __speech = _data["__speech"]
        CyScript += `
                    ,{ data : { id: "_${__speech}", label: "${__speech}" }, classes: "speech ${__speech}"}`
        speech.push(__speech)
          
        __usageNumber = 0
        _data["__usage"].forEach(function (__usage) {
          __usageNumber++

          if (viewMethod === 0) {
            CyScript += `
                        ,{ data : { id: "${__speech}_${__usageNumber}", label: "${__usageNumber}.", parent: "_${__speech}"}, classes: "number" }`
            __usage["___meaningPiece"].forEach(function(___meaningPiece){
              if ("" !== ___meaningPiece)
                CyScript += `
                        ,{ data : { id: "${__speech}_${__usageNumber}_${___meaningPiece}", label: "${___meaningPiece}", parent: "${__speech}_${__usageNumber}"}, classes: "meaning" }`
            })
            
            if (__usage["___synonym"][0] !== "")
              CyScript += `
                        ,{ data : { id: "${__speech}_${__usageNumber}_synonym", label: "synonym", parent: "${__speech}_${__usageNumber}"}, classes: "synonym" }`
            __usage["___synonym"].forEach(function(___synonym){
              if ("" !== ___synonym) {
                CyScript += `
                        ,{ data : { id: "${__speech}_${__usageNumber}_${___synonym}", label: "${___synonym}", parent: "${__speech}_${__usageNumber}_synonym"}, classes: "synonyms" }`
              }
            })

            if (__usage["___not"][0] !== "")
              CyScript += `
                        ,{ data : { id: "${__speech}_${__usageNumber}_not", label: "not", parent: "${__speech}_${__usageNumber}"}, classes: "not" }`
            __usage["___not"].forEach(function(___not){
              if ("" !== ___not)
                CyScript += `
                        ,{ data : { id: "${__speech}_${__usageNumber}_${___not}", label: "${___not}", parent: "${__speech}_${__usageNumber}_not"}, classes: "nots" }`
            })
          } else if (viewMethod === 1) {
            CyScript += `
                        ,{ data : { id: "${__speech}_${__usageNumber}", label: "${__usageNumber}."} }`
            __usage["___meaningPiece"].forEach(function(___meaningPiece){
              if ("" !== ___meaningPiece)
                CyScript += `
                        ,{ data : { id: "${__speech}_${__usageNumber}_${___meaningPiece}", label: "${___meaningPiece}"} }`
            })

            if (__usage["___synonym"][0] !== "")
              CyScript += `
                        ,{ data : { id: "${__speech}_${__usageNumber}_synonym", label: "synonym"} }`
            __usage["___synonym"].forEach(function(___synonym){
              if ("" !== ___synonym) {
                CyScript += `
                        ,{ data : { id: "${__speech}_${__usageNumber}_${___synonym}", label: "${___synonym}"} }`
              }
            })

            if (__usage["___not"][0] !== "")
              CyScript += `
                        ,{ data : { id: "${__speech}_${__usageNumber}_not", label: "not" } }`
            __usage["___not"].forEach(function(___not){
              if ("" !== ___not)
                CyScript += `
                        ,{ data : { id: "${__speech}_${__usageNumber}_${___not}", label: "${___not}"} }`
            })
          }
        })
      })
          
      CyScript += `
                    ],
                    edges: [`

      speech.forEach(function (_speech, idx, array) {
        CyScript += `
                      { data : { source: "${mongoRes['_wordset']}", target: "_${_speech}" } }`  
        if (idx !== array.length - 1) CyScript += ','
      })

      if (viewMethod === 1) {
        mongoRes["_data"].forEach(function (_data) { 
          __speech = _data["__speech"] 
          __usageNumber = 0
          _data["__usage"].forEach(function (__usage) {
            __usageNumber++
  
            CyScript += `
                      ,{ data : { source: "_${__speech}", target: "${__speech}_${__usageNumber}"} }`
            __usage["___meaningPiece"].forEach(function(___meaningPiece){
              if ("" !== ___meaningPiece)
                CyScript += `
                      ,{ data : { source: "${__speech}_${__usageNumber}", target: "${__speech}_${__usageNumber}_${___meaningPiece}"} }`
            })

            if (__usage["___synonym"][0] !== "")
              CyScript += `
                      ,{ data : { source: "${__speech}_${__usageNumber}", target: "${__speech}_${__usageNumber}_synonym"} }`
            __usage["___synonym"].forEach(function(___synonym){
              if ("" !== ___synonym) {
                CyScript += `
                      ,{ data : { source: "${__speech}_${__usageNumber}_synonym", target: "${__speech}_${__usageNumber}_${___synonym}"} }`
              }
            })

            if (__usage["___not"][0] !== "")
              CyScript += `
                      ,{ data : { source: "${__speech}_${__usageNumber}", target: "${__speech}_${__usageNumber}_not" } }`
            __usage["___not"].forEach(function(___not){
              if ("" !== ___not)
                CyScript += `
                      ,{ data : { source: "${__speech}_${__usageNumber}_not", target: "${__speech}_${__usageNumber}_${___not}"} }`
            })
          })
        })
      }

      CyScript += `
                    ]
                },
                style: [
                  {
                      selector: 'node',
                      style: {
                          'content': 'data(label)',
                          'text-valign': 'center',
                          'text-outline-width': 0.8,
                          'color': 'white',
                          'font-size': 8,
                          'text-outline-color': '#000',
                          'background-color': '#000',
                          'border-width':0,
                          'z-index':3,
                          'padding':2,
                          'shape':'round-rectangle',
                          'text-wrap':'none',
                          'text-max-width':100,
                          'height':'label',
                          'width':'label'
                      }
                  },
                  {
                      selector: ':parent',
                      style: {
                          'text-valign': 'top',
                          'text-halign': 'center',
                          'background-color': '#000',
                          'border-width':1,
                          'border-style':'dotted',
                          'border-color':'#aaa',
                          'z-index':2,
                          'padding':2
                      }
                  },
                  {
                      selector: 'edge',
                      style: {
                          'width': 1,
                          'curve-style': 'unbundled-bezier',
                          'line-color': '#FF0',
                          'target-arrow-color': '#FF0',
                          'target-arrow-shape': 'vee',
                          'target-arrow-fill': 'hollow',
                          'arrow-scale': 0.8,
                          'z-index':0
                      }
                  },
                  {
                      selector: '.number',
                      style: {
                          'padding' : 10
                      }
                  },
                  {
                      selector: '.wordset',
                      style: {
                          'border-color' : '#fbfb11',
                          'border-width' : 3,
                          'font-size': 16
                      }
                  },
                  {
                      selector: '.speech',
                      style: {
                          'background-color': '#222',
                          'font-size': 12,
                          'border-color':'#fff',
                          'border-width':1,
                          'border-opacity':0.9,
                          'border-style':'solid',
                          'padding' : 5
                      }
                  },
                  {
                      selector: '.not',
                      style: {
                        'font-size' : 11,
                        'color':'#DC143C'
                      }
                  },
                  {
                      selector: '.synonym',
                      style: {
                        'font-size' : 11,
                        'color':'#00ff7f'
                      }
                  },
                  {
                      selector: '.verb',
                      style: {
                      }
                  },
                  {
                      selector: '.meaning, .synonyms, .nots',
                      style: {
                          'font-size': 10
                      }
                  }
              ],
              layout: {
                  name: 'cose-bilkent',
                  
                  // Called on layoutready
                  ready: function () {
                  },
                  // Called on layoutstop
                  stop: function () {
                  },
                  
                  // 'draft', 'default' or 'proof" 
                  // - 'draft' fast cooling rate 
                  // - 'default' moderate cooling rate 
                  // - "proof" slow cooling rate
                  quality: 'default',

                  // Whether to include labels in node dimensions. Useful for avoiding label overlap
                  nodeDimensionsIncludeLabels: true,

                  // number of ticks per frame; higher is faster but more jerky
                  refresh: 30,

                  // Whether to fit the network view after when done
                  fit: true,

                  // Padding on fit
                  padding: 10,

                  // Whether to enable incremental mode
                  randomize: true,

                  // Node repulsion (non overlapping) multiplier
                  nodeRepulsion: 4500,

                  // Ideal (intra-graph) edge length
                  idealEdgeLength: 20,
                  
                  // Divisor to compute edge forces
                  edgeElasticity: 0.2,

                  // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
                  nestingFactor: 0.1,
                  
                  // Gravity force (constant)
                  gravity: 0.25,

                  // Maximum number of iterations to perform
                  numIter: 2500,

                  // Whether to tile disconnected nodes
                  tile: true,

                  // Type of layout animation. The option set is {'during', 'end', false}
                  animate: 'end',

                  // Duration for animate:end
                  animationDuration: 500,

                  // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
                  tilingPaddingVertical: 6,

                  // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
                  tilingPaddingHorizontal: 6,

                  // Gravity range (constant) for compounds
                  gravityRangeCompound: 1.5,

                  // Gravity force (constant) for compounds
                  gravityCompound: 1.0,

                  // Gravity range (constant)
                  gravityRange: 3.8,
                  
                  // Initial cooling factor for incremental layout
                  initialEnergyOnIncremental: 0.5
              },
              // initial viewport state:
              zoom: 1,
              pan: { x: 0, y: 0 },

              // interaction options:
              minZoom: 0.8,
              maxZoom: 2.37,
              zoomingEnabled: true,
              userZoomingEnabled: true,
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

                dummyDomEle.innerHTML = content.innerHTML
                dummyDomEle.innerHTML += '<br>'

                return dummyDomEle;
              },
              // your own preferences:
              appendTo: document.body,
              arrow: true,
              allowHTML: true,
              interactive: true,
              placement: 'auto',
              hideOnClick: false,
              multiple: true,
              sticky: true,
              theme: 'agjak'
            });

            tip.show()
            node.tip = tip
          }

          cy.on('tap', 'node', function(){
              try { // your browser may block popups
                  // window.open( this.data('href') );
                  console.log(this.data('id') + ' node tapped!')
              } catch(e){ // fall back on url change
                  // window.location.href = this.data('href');
              }
          })

          cy.on('mouseover', '.speech', function(){
              this.style('border-width', 2)
              makePopper(this)
          })

          cy.on('mouseout', '.speech', function(){
              this.style('border-width', 1)
              this.tip.destroy()
          })

          cy.on('mouseover', '.number', function(){
              this.style('border-width', 2)
              this.style('border-color', '#fff')
              this.style('border-style', 'solid')
              this.style('font-size', '12')
              makePopper(this)
          })

          cy.on('mouseout', '.number', function(){
              this.style('border-width', 1)
              this.style('border-color', '#aaa')
              this.style('border-style', 'dotted')
              this.style('font-size', '8')
              this.tip.destroy()
          })

          cy.on('mouseover', '.meaning', function(){
              this.style('border-width', 1)
              this.style('border-color', '#fbfb11')
              $('html,body').css('cursor', 'pointer');
              makePopper(this.parent())
          })

          cy.on('mouseout', '.meaning', function(){
              this.style('border-width', 0)
              $('html,body').css('cursor', 'default');
              this.parent().tip.destroy()
          })

          cy.on('mouseover', '.synonyms', function(){
            this.style('border-width', 1)
            this.style('border-color', '#00ff7f')
            $('html,body').css('cursor', 'pointer');
          })

          cy.on('mouseout', '.synonyms', function(){
              this.style('border-width', 0)
              $('html,body').css('cursor', 'default');
          })

          cy.on('mouseover', '.nots', function(){
            this.style('border-width', 1)
            this.style('border-color', '#DC143C')
            $('html,body').css('cursor', 'pointer');
          })

          cy.on('mouseout', '.nots', function(){
              this.style('border-width', 0)
              $('html,body').css('cursor', 'default');
          })

          cy.edges().forEach(function(edge){
              if(edge.target().id() === "${mongoRes['_wordset']}") {
                  edge.style('width', '2.2')
                  edge.style('line-color', '#fbfb11')
                  edge.style('target-arrow-color', '#fdfd11')
                  edge.style('target-arrow-fill', 'filled')
                  edge.style('arrow-scale', 1.0)
              }
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
                        
                        ${CyScript}`
        mongoRes['_data'].forEach(function(_data){
          HTML += `
                        <div id="_${_data['__speech']}" class="hidden">
                        <h1 style="border-top:1px solid yellow;font-size:2em;font-weight:bold;color:#fff" class="entry-title">${_data['__represent']}   `
          
          if (_data['__speech'] !== "")
            HTML += `
                        [${_data['__speech']}]   `

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
                      <div id="${_data['__speech']}_${idx}" class="hidden">
                      <h4 style="font-size:1.4em;font-weight:500;color:#cfc;font-style: italic">${idx}. `

            
            __usage["___extra"].forEach(function(___extra) {
              HTML += `${___extra} `
            })

            HTML += `</h4><span style="font-size:1.2em">${__usage["___meaning"]}</span></br>`

            __usage["___image"].forEach(function(___image) {
              if (___image !== "")
                HTML += `<img src=${___image} width=80%>`
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
  
  
  </div> <!-- whole_wrapper -->
  
  </body>
  </html>`
      
      res.send(HTML)
    })
  }
}
