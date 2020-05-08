var data = json.data
var root = json.root

cy.add([{group: 'nodes', data : { id: root, label: root }, classes: "root" } ])

data.forEach(function (item, idx){
    fetch("${TARGET}/video?target="+item["_video"]).then(response => response.json().then(videoJson => {
        const usageID = idx+'_'+item['_usage']
        videoJsonList[usageID] = videoJson
        let div = document.createElement('div')
        div.setAttribute("class","hidden")
        div.setAttribute("id",usageID)

        let transDiv = document.createElement('div')
        transDiv.setAttribute("class","hidden")
        transDiv.setAttribute("id",`trans_${usageID}`)

        //
        // create a text area in the tippy
        //

        // this table shows information about the usgae
        usageAndChunkHTML = `
        <table>
            <tr style="text-align:center;font-size:1.4em;font-weight:bold;color:salmon;">
                <th colspan=100%>&lt; ${item['_usage']} &gt;</th>
            </tr>
        </table>
        <table>`

        chunks = item["_chunks"]
        if (chunks !== undefined) {
            usageAndChunkHTML += `<tr>`
            chunks.forEach(function (chunk) {
                usageAndChunkHTML += `<td width="${100/chunks.length}%">${chunk}</td>`
            })
            usageAndChunkHTML += `</tr>`
        }
        usageAndChunkHTML += `</table>`

        div.innerHTML = usageAndChunkHTML

        // scripts from videoJson
        videoJson["text"].forEach(function(elm, idx) {
            // highlight usage
            if (item["_text"] !== undefined) {
                item["_text"].forEach(function (text){
                    elm = elm.replace(text, '<b style="color:red;font-style:italic !important">'+text+'</b>')
                })
            }
            var start_timestamp = 0
            if (videoJson["start_timestamp"] !== undefined) {
                start_timestamp = videoJson["start_timestamp"][idx]
            }
            var end_timestamp = 0
            if (videoJson["end_timestamp"] !== undefined) {
                end_timestamp = videoJson["end_timestamp"][idx]
            }
            var literal = ''
            if (videoJson["literal"] !== undefined) {
                literal = videoJson["literal"][idx]
            }
            var pharaphrase = ''
            if (videoJson["pharaphrase"] !== undefined) {
                pharaphrase = videoJson["pharaphrase"][idx]
            }

            div.innerHTML += `
            <div class="${usageID}_des des" id="des_${start_timestamp}">
                ${elm}
            </div><br>
            <span class="${usageID}_startT" id="startT_${start_timestamp}" style="display:none">${start_timestamp}</span>
            <span class="${usageID}_endT" id="endT_${start_timestamp}" style="display:none">${end_timestamp}</span>
            `

            transDiv.innerHTML += `
            <div class="table ${usageID}_script" id="script_${start_timestamp}" style="display:none">
                <div class="rowGroup">
                    <div class="row">
                        <span class="cell">[본문]</span>
                        <span class="trans_cell" id="script_${end_timestamp}">${elm}</span>
                    </div>
                </div>
            </div>
            <div class="table ${usageID}_literal" id="literal_${start_timestamp}" style="display:none">
                <div class="rowGroup">
                    <div class="row">
                        <span class="cell">[직역]</span>
                        <span class="trans_cell" id="literal_${end_timestamp}">${literal}</span>
                    </div>
                </div>
            </div>
            <div class="table ${usageID}_pharaphrase" id="pharaphrase_${start_timestamp}" style="display:none">
                <div class="rowGroup">
                    <div class="row">
                        <span class="cell">[의역]</span>
                        <span class="trans_cell" id="pharaphrase_${end_timestamp}">${pharaphrase}</span>
                    </div>
                </div>
            </div>
            `
        })

        // these divs will be called at the makePopper()
        document.getElementById('content').appendChild(div);
        document.getElementById('content').appendChild(transDiv);
        
        const label = item['_usage'].replace('<br>', '\n')

        // add cytoscape elements
        cy.add([{group: 'nodes', data : { id: usageID, label : label }, classes: "usage usage_node_"+ item["_speech"] } ])
        cy.add([{group: 'edges', data : { source: root, target : usageID }, classes: "edge edge_"+ item["_speech"] } ])
        chunks = item["_chunks"]
        if (chunks !== undefined) {
            chunks.forEach(function (chunk) {
                const id = usageID+"_"+chunk
                cy.add([{group: 'nodes', data : { id: id, label : chunk }, classes: "chunk" } ])
                cy.add([{group: 'edges', data : { source: id, target : usageID }, classes: "edge edge_chunk" } ])
            })
        }
            
        // layout options
        var options = {
            name: 'cose-bilkent',
            ready: function (e) {
                var cy = e.cy;
                cy.nodes().forEach(function(node){
                    if (node.classes()[0] === "number" || node.classes()[0] === "usage"){
                        makePopper(node)
                    }
                    node._styleOrigin = node.style()
                })
            },
            stop: function (e) {
                var cy = e.cy
                cy.setOrigin = function () {
                    cy._zoomOrigin = cy.zoom()
                    cy._panOrigin = { 'x':cy.pan()['x'], 'y':cy.pan()['y'] }
                }
                cy.setOrigin()

                // set a initial page
                if (idx === data.length-1) {
                    cy.nodes().forEach(function(node){
                        if (node.data()["id"].split('_')[1] === '${usageCover}' && node.classes()[0] === 'usage') {
                            node.emit('tap')
                        }
                    })
                }
            },
            quality: 'default',
            nodeDimensionsIncludeLabels: true,
            refresh: 30,
            fit: true,
            padding: 10,
            randomize: true,
            nodeRepulsion: 4500,
            idealEdgeLength: 80,
            edgeElasticity: 0.1,
            nestingFactor: 0.1,
            gravity: 0.25,
            numIter: 2500,
            tile: true,
            animate: 'end',
            animationDuration: 200,
            tilingPaddingVertical: 6,
            tilingPaddingHorizontal: 6,
            gravityRangeCompound: 1.5,
            gravityCompound: 1.0,
            gravityRange: 3.8,
            initialEnergyOnIncremental: 0.5,
            animationEasing: 'ease-out'
        }
        cy.layout(options).run()
    }))
})