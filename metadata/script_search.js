//
// search AJAX fetch codes for a client-side web brower
// This code will be loaded from HTMLLoader
//

// TARGEt will be replaced to appropriate URL in the HTMLLoader
fetch("${TARGET}/cy?target=${searchTarget}").then(response => response.json().then(json => {
    var data = json.data
    var root = json.root

    cy.add([{group: 'nodes', data : { id: root, label: root }, classes: "root" } ])
    
    data.forEach(function (item, idx){
        fetch("${TARGET}/video?target="+item["_video"]).then(response => response.json().then(videoJson => {
            const usageID = idx+'_'+item['_usage']
            videoList[usageID] = videoJson
            let div = document.createElement('div');
            div.setAttribute("class","hidden");
            div.setAttribute("id",usageID);

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
            videoJson["text"].forEach(function(elm) {
                if (item["_text"] !== undefined)
                    item["_text"].forEach(function (text){
                        elm = elm.replace(text, '<b style="color:red;font-style:italic">'+text+'</b>')
                    })
                div.innerHTML += '<span>' + elm + '</span><br>'
            })
            document.getElementById('content').appendChild(div);
            
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
}));