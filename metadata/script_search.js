fetch("${TARGET}/cy?target=${searchTarget}").then(response => response.json().then(json => {
    var data = json.data
    var root = json.root

    cy.add([{group: 'nodes', data : { id: root, label: root }, classes: "root" } ])
    
    data.forEach(function (item, idx){
        fetch("${TARGET}/video?target="+item["_video"]).then(response => response.json().then(videoJson => {
            const usageID = idx+'_'+item['_usage']
            let div = document.createElement('div');
            div.setAttribute("class","hidden");
            div.setAttribute("id",usageID);
            size = getIframeSize()
            
            div.innerHTML = '<div class="video" style="text-align:center; color:#ffa07a;font-size:1.2em">'
            div.innerHTML += '  <iframe class="iframe_video" width='+size['width']+'px height='+size['height']+'px src=https://www.youtube.com/embed/'+videoJson["link"]+'></iframe>'
            div.innerHTML += '  <div class="caption"><h3 style="text-align:center;font-size:1.6em;font-weight:bold;color:salmon;border-bottom:1px dotted #fff;padding-bottom:.2em">&lt; '+ videoJson["source"] +' &gt;</h3>'
            videoJson["text"].forEach(function(elm) {
                if (item["_text"] !== undefined)
                    item["_text"].forEach(function (text){
                        elm = elm.replace(text, '<b style="color:red;font-style:italic">'+text+'</b>')
                    })
                div.innerHTML += '<span style="font-size:1.4em;font-weight:500;color:#cfc;">' + elm + '</span><br>'
            })
            div.innerHTML += '</div></div>'
            document.getElementById('content').appendChild(div);
            
            const label = item['_usage'].replace('<br>', '\n')

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