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
              'text-valign': 'center','text-outline-width': 0.8,'font-size': 8,'text-outline-color': '#000','text-wrap':'wrap','text-max-width':'1000px',
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
      {selector: '.usage',style: {'background-color': '#222','font-size': 12,'border-color':'#fff','border-width':1,'border-opacity':0.9,'border-style':'solid','padding' : 5,'background-opacity':0.5}},
      {selector: '.chunk',style: {'border-color':'#fff','border-width':0.5,'border-opacity':0.8,'border-style':'dotted','padding':3,'background-opacity':0.5}},

      // edge style
      {selector: '.edge',style: {'width':0.8, 'opacity':0.8, 'arrow-scale': 1.0, 'line-color': 'DarkViolet','target-arrow-color': 'DarkViolet'}},
      {selector: '.edge_verb', style: {'line-color': 'Tomato', 'target-arrow-color': 'Tomato'}},
      {selector: '.edge_noun', style: {'line-color': 'SpringGreen','target-arrow-color': 'SpringGreen'}},
      {selector: '.edge_adjective', style: {'line-color': 'Turquoise','target-arrow-color': 'Turquoise'}},
      {selector: '.edge_adverb',style: {'line-color': 'DeepPink','target-arrow-color': 'DeepPink'}},
      {selector: '.edge_preposition', style: {'line-color': 'Pink','target-arrow-color': 'Pink'}},
      {selector: '.edge_conjunction',style: {'line-color': 'SlateBlue','target-arrow-color': 'SlateBlue'}},
      {selector: '.edge_chunk',style: {'line-color': 'White','arrow-scale': 0.8, 'target-arrow-fill': 'filled','target-arrow-shape': 'circle','target-arrow-color': 'White','curve-style': 'straight', 'opacity':0.5}},
      
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
        theme: 'sensebe',
        maxWidth: 1340,
        distance: 30
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
      node.tip.show()
      const contentY = document.getElementsByClassName('tippy-content')[0].offsetHeight
      node.tip.hide()
      let posY = node.position()['y'] * cy.zoom()
      
      const divCy = document.getElementById('cy')
      const cyHeight = divCy.offsetHeight
      const margin = cyHeight - contentY
      const offset_y = cyHeight - posY - (margin/2)

    //   console.log("cyHeight : ",cyHeight)
    //   console.log("posY : ",posY)
    //   console.log("margin/2 : ",margin/2)
    //   console.log("offset_y : ",offset_y)
    //   console.log("contentY", contentY)

      cy.animate({
        pan: { x: cy._panOrigin['x'], y: offset_y },
        zoom: cy.zoom()
      }, {
        duration: ms,
        complete: () => node.tip.show()
      })
  }
}

cy.on('tap', function(event){
    var evtTarget = event.target;

    // tap on background
    if( evtTarget === cy ) {
        cy.nodes().forEach(function (node){
            if (node._trigger === true) 
                flipTrigger(node)
        })
    }
})

cy.on('tapend', function(event){
    var evtTarget = event.target;

    // tap on background
    if( evtTarget === cy ) {
        // cy.setOrigin()
        // console.log(cy.pan())
        // console.log(cy.zoom())
    }
})

document.addEventListener("dragstart", function( event ) {
    // store a ref. on the dragged elem
    dragged = event.target;
    // make it half transparent
    event.target.style.opacity = .5;
}, false);

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

// Resizing
var rtime;
var timeout = false;
var delta = 100;
$(window).resize(function() {
    rtime = new Date();
    if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
    }
});

function getIframeSize () {
    cyWidth = document.getElementById('cy').offsetWidth
    iframeWidth = cyWidth - (cyWidth*1/10)
    if (iframeWidth >= 1280)
        iframeWidth = 1280
    iframeHeight = iframeWidth/2

    return {
        "width":iframeWidth,
        "height":iframeHeight
    }
}

function resizeend() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
        timeout = false;
        // cy.resize()
        cy.fit()
        cy.setOrigin()
        videos = document.getElementsByClassName('iframe_video')
        size = getIframeSize()
        for (let video of videos) {
            video.setAttribute('width', size['width'])
            video.setAttribute('height', size['height'])
        }
    }               
}
//