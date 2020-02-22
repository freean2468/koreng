var cy = cytoscape({
    container: document.getElementById('cy'),
    elements: {
        nodes: [],
        edges: []
    },
    style: [
      {
          selector: 'node',
          style: {
              'content': 'data(label)','height':'label','width':'label',
              'text-valign': 'center','text-outline-width': 0.8,'font-size': 8,'text-outline-color': '#000','text-wrap':'none','text-max-width':100,
              'color': 'white','background-color': '#000',
              'border-width':0,'padding':5,'shape':'round-rectangle','z-compound-depth':'top'
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
      {selector: '.root',style: {'border-color' : '#fbfb11','border-width' : 3,'font-size': 16}},
      {selector: '.usage',style: {'background-color': '#222','font-size': 12,'border-color':'#fff','border-width':1,'border-opacity':0.9,'border-style':'solid','padding' : 5}},
      {selector: '.chunk',style: {'font-size': 10}},

      // edge style
      {selector: '.edge',style: {'width':0.8, 'opacity':0.6, 'arrow-scale': 1.0, 'line-color': 'DarkViolet','target-arrow-color': 'DarkViolet'}},
      {selector: '.edge_verb', style: {'line-color': 'Tomato', 'target-arrow-color': 'Tomato'}},
      {selector: '.edge_noun', style: {'line-color': 'SpringGreen','target-arrow-color': 'SpringGreen'}},
      {selector: '.edge_adjective', style: {'line-color': 'Turquoise','target-arrow-color': 'Turquoise'}},
      {selector: '.edge_adverb',style: {'line-color': 'DeepPink','target-arrow-color': 'DeepPink'}},
      {selector: '.edge_preposition', style: {'line-color': 'Pink','target-arrow-color': 'Pink'}},
      {selector: '.edge_conjunction',style: {'line-color': 'SlateBlue','target-arrow-color': 'SlateBlue'}},
      
      // usage_node style
      {selector: '.usage',style: {'color': 'DarkViolet'}},
      {selector: '.usage_node_verb', style: {'color': 'Tomato'}},
      {selector: '.usage_node_noun', style: {'color': 'SpringGreen'}},
      {selector: '.usage_node_adjective', style: {'color': 'Turquoise'}},
      {selector: '.usage_node_adverb',style: {'color': 'DeepPink'}},
      {selector: '.usage_node_preposition',style: {'color': 'Pink'}},
      {selector: '.usage_node_conjunction',style: {'color': 'SlateBlue'}}
  ],

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
            console.log(node.data('id'))
            let content = document.getElementById(node.data('id'));
            console.log(content)
            let dummyDomEle = document.createElement('div');

            dummyDomEle.innerHTML = content.innerHTML + '<br>'

            console.log(dummyDomEle.innerHTML)

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
        maxWidth: 1340,
        distance: 60
    });

    node._trigger = false
    node.tip = tip
}

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
      cy.stop()
      cy.animate({
        fit: {
          eles: node,
          padding: 20
        }
      }, {
        duration: 0
      });
      offset_x = document.getElementById('content').offsetWidth/2
      offset_y = document.getElementById('content').offsetHeight/2 - 70
      cy.animate({
        pan: { x: cy.pan()['x'], y: cy.pan()['y'] - offset_y },
        zoom: cy.zoom()
      }, {
        duration: ms
      });
      node.tip.show()
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

cy.on('tap', '.usage', function() {
    origin = this
    cy.nodes().forEach(function (node){
        if (node._trigger === true && node !== origin) flipTrigger(node)
    })
    flipTrigger(this) 
})

cy.on('mouseover', '.usage', function() {
    this.style('border-width', 2) 
    $('html,body').css('cursor', 'pointer')
})

cy.on('mouseout', '.usage', function() {
    this.style('border-width', 1)
    $('html,body').css('cursor', 'default')
})