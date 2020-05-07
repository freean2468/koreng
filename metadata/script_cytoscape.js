//
// cytoscape library customizing for a client-side web brower
// This code will be loaded from HTMLLoader
//

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
            let transContent = document.getElementById(`trans_${node.data('id')}`);
            let dummyDomEle = document.createElement('div');

            // vcon for a video part (on the left)
            // tcon for a text part (on the right)
            dummyDomEle.innerHTML = `
            <div class="tippy_container">
                <div id="vcon_${node.data('id')}" class="tippy_video_container">
                    <div id="trcon_${node.data('id')}" class="tippy_trans_container">
                        ${transContent.innerHTML}
                    </div>
                </div>
                <div id="tcon_${node.data('id')}" class="tippy_text_container">
                    ${content.innerHTML}
                </div>
            </div>`

            return dummyDomEle;
        },
        // your own preferences:
        appendTo: document.body,
        arrow: false,
        allowHTML: true,
        interactive: true,
        placement: 'auto',
        hideOnClick: false,
        multiple: false,
        sticky: true,
        theme: 'sensebe',
        maxWidth: 2000,
        distance: 30,
        moveTransition: 'transform 0.2s ease-out'
    });

    node._trigger = false
    node.tip = tip
}

var tp // tp will point the poped up video
var tpTimeout
var youtubePlayerList = []
var youtubePlayerTimeoutList = []
var videoJsonList = [] // videoJsonList have video jsons from searched results
const IFRAME_WIDTH_MIN = 480
const IFRAME_HEIGHT_MIN = getIframeHeight(IFRAME_WIDTH_MIN)
const IFRAME_WIDTH_MAX = 1920

// Using HD Ratio
function getIframeHeight(width){
    return width * 9 / 16
}

function onYouTubeIframeAPIReady() {
    console.log('API ready!!')
}

function onPlayerReady(event) {
    // event.target.playVideo();
    console.log('player ready!!')
}

function getCurrentTimeOfTp(vid) {
    let tp = youtubePlayerList[vid]
    // takes time to prepare functions of Youtube Player
    // console.log(tp)
    if (tp.getCurrentTime === undefined) {
        console.log('takes time to prepare functions of Youtube Player')
        tpTimeout = setTimeout(getCurrentTimeOfTp.bind(null, vid), 100)
        return
    }

    const ct = tp.getCurrentTime()
    // console.log("current time : ", ct)
    // console.log(tp)

    const desElems = document.getElementsByClassName(`${tp._sensebe_usage_id}_des`)
    const literalElems = document.getElementsByClassName(`${tp._sensebe_usage_id}_literal`)
    const pharaphraseElems = document.getElementsByClassName(`${tp._sensebe_usage_id}_pharaphrase`)

    const desElemList = Array.prototype.filter.call(desElems, function(elem){
        const id = Number(elem.id.split('_').pop())
        return id <= ct
    })
    const literalElemList = Array.prototype.filter.call(literalElems, function(elem){
        const id = Number(elem.id.split('_').pop())
        return id <= ct
    })
    const pharaphraseElemList = Array.prototype.filter.call(pharaphraseElems, function(elem){
        const id = Number(elem.id.split('_').pop())
        return id <= ct
    })

    const recentDes = desElemList.pop()
    const recentLiteral = literalElemList.pop()
    const recentPharaphrase = pharaphraseElemList.pop()

    if (recentDes !== undefined) {
        // check end_timestamp
        literalTransCell = recentLiteral.getElementsByClassName('trans_cell')
        endT = literalTransCell[0].id.split('_').pop()
        pharaphraseTransCell = recentPharaphrase.getElementsByClassName('trans_cell')
        if (endT <= ct) {
            literalTransCell[0].style.color = 'transparent'
            pharaphraseTransCell[0].style.color = 'transparent'    
        } else {
            literalTransCell[0].style.color = null
            pharaphraseTransCell[0].style.color = null
        }

        // change the size of description of the playing
        if (tp._sensebe_currentDesId !== recentDes.getAttribute('id')) {
            tp._sensebe_currentDesId = recentDes.getAttribute('id')

            for (let i = 0; i<desElems.length; ++i) {
                desElems[i].style.fontSize = null
                desElems[i].style.color = null
                literalElems[i].style.display = 'none'
                pharaphraseElems[i].style.display = 'none'
            }
            recentDes.style.fontSize = '1.3em'
            recentDes.style.fontWeight = 1000
            recentDes.style.color = '#fc0'

            for(let i = 0; i < literalElems.length; ++i) {
                let elem = literalElems[i]
                transCell = elem.getElementsByClassName(`trans_cell`)
                transCell[0].style.color = null

                elem = pharaphraseElems[i]
                transCell = elem.getElementsByClassName(`trans_cell`)
                transCell[0].style.color = null
            }

            console.log('[getCurrentTImeOfTp] recentLiteral : ', recentLiteral)

            recentLiteral.style.display = 'table'
            recentPharaphrase.style.display = 'table'
        }
    }

    switch (tp.getPlayerState()) {
        case YT.PlayerState.ENDED:
            // console.log('ended');
            for (let i = 0; i<desElems.length; ++i) {
                // desElems[i].style.fontSize = null
                desElems[i].style.color = null
                literalElems[i].style.display = 'none'
                pharaphraseElems[i].style.display = 'none'
            }
            if (recentDes !== undefined) {
                recentDes.style.color = null
                recentDes.style.fontWeight = null
            }
            break
        case YT.PlayerState.UNSTARTED:
        case YT.PlayerState.PLAYING:
        case YT.PlayerState.PAUSED:
            tpTimeout = setTimeout(getCurrentTimeOfTp.bind(null, vid), 100)
            break
    }
}

function onPlayerStateChange(event) {
    switch (event.data) {
      case YT.PlayerState.UNSTARTED:
        console.log('[unstarted]');
        break;
      case YT.PlayerState.ENDED:
        console.log('[ended]');
        break;
      case YT.PlayerState.PLAYING:
        console.log('[playing]');
        // When it starts to play, grow up the size of the video so that it could be seen recognizably
        if (event.target._sensebe_state === false) {
            event.target._sensebe_state = true
            size = getIframeSize()
            sizeVideo(event.target._sensebe_vid, size['width'], size['height'])
            trcon = document.getElementById(`trcon_${event.target._sensebe_usage_id}`)
            trcon.style.maxWidth = `${size['width']}px`
        }
        tpTimeout = setTimeout(getCurrentTimeOfTp.bind(null, event.target._sensebe_vid), 100)
        break;
      case YT.PlayerState.PAUSED:
        console.log('[paused]');
        break;
      case YT.PlayerState.BUFFERING:
        console.log('[buffering]');
        break;
      case YT.PlayerState.CUED:
        console.log('[video cued]');
        break;
    }
}

function sizeVideo(id, width, height) {
    video = document.getElementById(id)
    video.setAttribute('width', width)
    video.setAttribute('height', height)
}

function flipTrigger(node) {
    ms = 200
    if (node._trigger) {
        clearTimeout(tpTimeout)
        let tp = youtubePlayerList[node._sensebe_vid]

        const desElems = document.getElementsByClassName(`${tp._sensebe_usage_id}_des`)
        const literalElems = document.getElementsByClassName(`${tp._sensebe_usage_id}_literal`)
        const pharaphraseElems = document.getElementsByClassName(`${tp._sensebe_usage_id}_pharaphrase`)

        for (let i = 0; i<desElems.length; ++i) {
            desElems[i].style.fontSize = null
            desElems[i].style.color = null
            desElems[i].style.fontWeight = null
            literalElems[i].style.display = 'none'
            pharaphraseElems[i].style.display = 'none'
        }

        node._trigger = false
        // when it's off, get back to the minimum size
        sizeVideo(`player_${node.data('id')}`, IFRAME_WIDTH_MIN, IFRAME_HEIGHT_MIN)
        // tp.seekTo(0, false)
        // tp.stopVideo()
        delete(tp)
        iframe = document.getElementById(node._sensebe_vid)
        iframe.parentNode.removeChild(iframe);
        node.tip.hide()
    } else {
        node._trigger = true

        console.log('[FLIP Trigger] node.tip : ', node.tip)

        // Youtube Player only can be created after tippy's up
        node.tip.show()
        const videoJson = videoJsonList[node.data('id')]
        node._sensebe_vid = `player_${node.data('id')}`

        document.getElementById(`trcon_${node.data('id')}`).insertAdjacentHTML("beforeBegin", 
        `<div id="player_${node.data('id')}" class="iframe_video"></div>`)

        // create Youtube player object so that we could control it.
        let youtubePlayer = new YT.Player(`player_${node.data('id')}`, {
            width: IFRAME_WIDTH_MIN,
            height: IFRAME_HEIGHT_MIN,
            videoId: videoJson["link"],
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onPlaybackQualityChange': function(){console.log('quality')},
                'onPlaybackRateChange': function(){console.log('rate')},
                'onError': function(e){console.log(e)}
            },
            host: 'https://www.youtube.com',
            playerVars: { 
                'origin':'${TARGET}' ,
                'rel':0
            }
        })
        // add availables for my uses
        youtubePlayer._sensebe_state=false
        youtubePlayer._sensebe_vid=`player_${node.data('id')}`
        youtubePlayer._sensebe_usage_id=`${node.data('id')}`
        youtubePlayer._sensebe_currentDesId=undefined

        youtubePlayerList[`player_${node.data('id')}`] = youtubePlayer


        // add events to descriptions on the tippy
        var descriptions = document.getElementsByClassName("des")
        for (var J in descriptions) {
            if (descriptions[J].addEventListener) {                    // For all major browsers, except IE 8 and earlier
                descriptions[J].addEventListener("click", desOnClick)
                descriptions[J].addEventListener("mouseover", desMouseover)
                descriptions[J].addEventListener("mouseout", desMouseout)
            } else if (descriptions[J].attachEvent) {                  // For IE 8 and earlier versions
                descriptions[J].attachEvent("click", desOnClick)
                descriptions[J].addEventListener("mouseover", desMouseover)
                descriptions[J].addEventListener("mouseout", desMouseout)
            }
        }

        // move to the start point of description
        function desOnClick() {
            let startT = this.id.split('_')[1]
            let tp = youtubePlayerList[node._sensebe_vid]
            tp.seekTo(startT)
        }

        function desMouseover() {
            $('html,body').css('cursor', 'pointer')
            this.style.backgroundColor = "DarkSlateGray"
        }

        function desMouseout() {
            $('html,body').css('cursor', 'default')
            this.style.backgroundColor = null
        }
    }
}

cy.on('tap', function(event){
    var evtTarget = event.target;

    // tap on background
    if( evtTarget === cy ) {
        cy.nodes().forEach(function (node){
            if (node._trigger === true)  {
                flipTrigger(node)
            }
        })
    }
})

cy.on('tap', '.usage', function() {
    origin = this
    cy.nodes().forEach(function (node){
        // the user selected other usage node as the other node had been triggered before
        if (node._trigger === true && node !== origin) {
          flipTrigger(node)
        }
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

//
// When the user resizes browser window
//
var rtime;
var timeout = false;
var delta = 100;
$(window).resize(function() {
    rtime = new Date();
    if (timeout === false) {
        timeout = true;
        setTimeout(resizeEnd, delta);
    }
});

function getIframeSize () {
    cyWidth = document.getElementById('cy').offsetWidth
    iframeWidth = cyWidth - (cyWidth*1/10)
    // 300 is the width of a text area
    iframeWidth -= 300
    if (iframeWidth >= 1920) {
        iframeWidth = 1920 - 300
    } else if (iframeWidth <= 480){
        iframeWidth = 480
    }
    iframeHeight = iframeWidth * (9/16)

    return {
        "width":iframeWidth,
        "height":iframeHeight
    }
}

function resizeEnd() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeEnd, delta);
    } else {
        timeout = false;
        // cy.resize()
        cy.fit()
        cy.setOrigin()
        videos = document.getElementsByClassName('iframe_video')
        size = getIframeSize()
        console.log('iframesize : ', size)
        for (let video of videos) {
            video.setAttribute('width', size['width'])
            video.setAttribute('height', size['height'])
        }
        trcons = document.getElementsByClassName(`tippy_trans_container`)
        for (let trcon of trcons) {
            trcon.style.maxWidth = `${size['width']}px`
        }
    }               
}