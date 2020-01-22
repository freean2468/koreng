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

      /* Generate Cy Data */
      var CyScript= `
      <script text="javascript">
            var cy = cytoscape({
                container: document.getElementById('cy'),
                elements: {
                    nodes: [
                      { data : { id: "${mongoRes['_wordset']}", name: "${mongoRes['_wordset']}" } }`
      var comeFrom = []
      var synonym = []
      var antonym = []

      mongoRes["_data"].forEach(function (_data) {
        _data["__usage"].forEach(function (__usage) {
          __usage["___comeFrom"].forEach(function(___comeFrom){
            if ("" === ___comeFrom) return
                
            let flag = false

            for (let i = 0; i < comeFrom.length; ++i) {
              if (comeFrom[i] === ___comeFrom){
                flag = true
                break
              }
            }
            if (flag === false)
              comeFrom.push(___comeFrom)
          })
          __usage["___synonym"].forEach(function(___synonym){
            if ("" === ___synonym) return

            let flag = false

            for (let i = 0; i < synonym.length; ++i) {
              

              if (synonym[i] === ___synonym){
                flag = true
                break
              }
            }
            if (flag === false) {
              synonym.push(___synonym)
            }
          })
          __usage["___antonym"].forEach(function(___antonym){
            if ("" === ___antonym) return

            let flag = false

            for (let i = 0; i < antonym.length; ++i) {
              if (antonym[i] === ___antonym){
                flag = true
                break
              }
            }
            if (flag === false) {
              antonym.push(___antonym)
            }
          })

          comeFrom.forEach(function (_comeFrom) {
            CyScript += `
                      ,{data : { id: "${_comeFrom}", name: "${_comeFrom}" } }`  
          })
          synonym.forEach(function (_synonym) {
            CyScript += `
                      ,{data : { id: "${_synonym}", name: "${_synonym}" } }`  
          })
          antonym.forEach(function (_antonym) {
            CyScript += `
                      ,{data : { id: "${_antonym}", name: "${_antonym}" } }`  
          })
          
        })
      })
      CyScript += `
                    ],
                    edges: [`
      comeFrom.forEach(function (_comeFrom, idx, array) {
        CyScript += `
                      {data : { source: "${_comeFrom}", target: "${mongoRes['_wordset']}" } }`  
        if (idx !== array.length - 1) CyScript += ','
        else if (synonym.length !== 0 || antonym.length !== 0) CyScript += ','
      })
      synonym.forEach(function (_synonym, idx, array) {
        CyScript += `
                      {data : { source: "${_synonym}", target: "${mongoRes['_wordset']}" } }`  
        if (idx !== array.length - 1) CyScript += ','
        else if (antonym.length !== 0) CyScript += ','
      })
      antonym.forEach(function (_antonym, idx, array) {
        CyScript += `
                      {data : { source: "${_antonym}", target: "${mongoRes['_wordset']}" } }`  
        if (idx !== array.length - 1) CyScript += ','
      })


      CyScript += `
                    ]
                },
                style: [
                  {
                      selector: 'node',
                      style: {
                          'width':10,
                          'height':10,
                          'content': 'data(name)',
                          'text-valign': 'center',
                          'text-outline-width': 0.5,
                          'color': 'white',
                          'font-size': 8,
                          'text-outline-color': '#000',
                          'background-color': '#000',
                          'border-width':0
                      }
                  },
                  {
                      selector: 'edge',
                      style: {
                          'width': 1,
                          'curve-style': 'straight',
                          'line-color': '#888',
                          'target-arrow-color': '#888',
                          'target-arrow-shape': 'vee',
                          'target-arrow-fill': 'hollow',
                          'arrow-scale': 0.5
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
                  idealEdgeLength: function( edge ){ return 12; },

                  // Divisor to compute edge forces
                  edgeElasticity: function( edge ){ return 32; },

                  // Nesting factor (multiplier) to compute ideal edge length for nested edges
                  nestingFactor: 1.2,

                  // Gravity force (constant)
                  gravity: 0,

                  // Maximum number of iterations to perform
                  numIter: 1000,

                  // Initial temperature (maximum node displacement)
                  initialTemp: 1000,

                  // Cooling factor (how the temperature is reduced between consecutive iterations
                  coolingFactor: 0.99,

                  // Lower temperature threshold (below this point the layout will end)
                  minTemp: 1.0
              }
          })

          cy.on('tap', 'node', function(){
              try { // your browser may block popups
                  // window.open( this.data('href') );
                  console.log(this.data('id') + ' node tapped!')
              } catch(e){ // fall back on url change
                  // window.location.href = this.data('href');
              }
          })

          cy.nodes().forEach(function(node){
            if(node.id() === "${mongoRes['_wordset']}"){
                node.style('background-color', '#fbfb11')
                node.style('width', 20)
                node.style('height', 20)
            }
          })

          cy.edges().forEach(function(edge){
              if(edge.target().id() === "${mongoRes['_wordset']}") {
                  edge.style('width', '2.5')
                  edge.style('line-color', '#fbfb11')
                  edge.style('target-arrow-color', '#fdfd11')
                  edge.style('target-arrow-fill', 'filled')
                  edge.style('arrow-scale', 1.5)
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
                        <h1 class="entry-title">${_data['__represent']}   [${_data['__speech']}]   `
                        if (_data["__tense"] !== "")
                          HTML += `
                        (${_data["__tense"]})`
          HTML += `
                        </h1>
                        
                        <h5>${_data['__pronounce']}</h5>`
            
            _data['__usage'].forEach(function(__usage){
              HTML += `
                        <p>`

              __usage["___extra"].forEach(function(___extra) {
                HTML += `${___extra}  `
              })

              HTML += `${__usage["___meaning"]}</p>`
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
