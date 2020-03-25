module.exports = HTMLLoader

//
// Before committing to github, If that is a service version, you should put 'true' into SERVICE variable
//
const SERVICE = false

var TARGET

if (SERVICE) {
  // for a service environment
  TARGET = "https://www.sensebedictionary.org"
} else {
  // for a local development environment
  TARGET = "http://localhost:5000"
}

// string replaceall function
function replaceAll(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}

//
// HTMLLoader manages the ways of loading html files.
//
function HTMLLoader() {
  this.fs = require('fs')
  this.pt = require('path')

  //
  // HTMLTemplate.json has a lists of URL which are src links, local js and css files.
  // This lists will be replaced to the head of the template down below.
  //
  this.templateJson = JSON.parse(this.fs.readFileSync("metadata/HTMLTemplate.json", 'utf8'))

  //
  // loads the search autocomplete js code from .js file then, this code will be replaced in the template down below
  //
  this.autocomplete = replaceAll(this.fs.readFileSync("metadata/script_autocomplete.js", 'utf8'), 'TARGET',TARGET)

  //
  // loads cytoscape js code then replace it to predetermined place in the templace down below
  //
  this.cytoscape = this.fs.readFileSync("metadata/script_cytoscape.js", 'utf8')

  // return HTML Template for the client
  this.getTemplate = function (page, html) {
    const metadata = this.templateJson[page]
    var template = `
<!doctype html>
<html>
  <head>
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-161851570-1"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'UA-161851570-1');
    </script>
    <script data-ad-client="ca-pub-9634519241047792" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
    
    <title>${metadata["title"]}</title>
    <meta charset="utf-8">`

    this.templateJson["src"].forEach(function (src){
      template += `
    <script src="${src}"></script>`
    })
    this.templateJson["link"].forEach(function (link){
      template += `
    <link rel="stylesheet" type="text/css" href="${link}">`
          })
      template +=`
    <link rel="icon" href="image/favicon-152.png" sizes="152x152">
  </head>
  <body id="index">
    <div id="whole_wrapper">
      <div class="head">
        <header>
          <hgroup>
            <p class="title"><a href="${TARGET}/search?target=sensebe&btnK=Sense+검색">SensebeDictionary ver.Beta</a></p>
            <p class="subtitle"><small>감각, 사전이 되다</small></p>
            <nav id="search_group">
              <div class="sgroup">
                <form class="search" action="/search" style="overflow:visible" data-submitfalse="q" method="GET" role="search">
                  <div id="autocomplete" class="autocomplete" >
                    <input class="autocomplete-input" name="target" maxlength="2048" type="text" aria-autocomplete="both" aria-haspopup="false" autocapitalize="off" autocomplete="off" autocorrect="off" role="combobox" spellcheck="false" title="검색" aria-label="검색"/>
                    <ul class="autocomplete-result-list"></ul>
                  </div>

                  <div class="item_btn">
                    <input class="search_btn" value="Sense 검색" aria-label="Sense 검색" name="btnK" type="submit">
                  </div>
                </form>
              </div>
            </nav> <!-- search_group -->
            <nav id="main_menu">
              <div class="wrapper">
                <ul class="sub_nav">
                  <li>
                  </li>
                </ul>
              </div>
            </nav>
          </hgroup> <!-- hgroup -->
          <nav id="left_nav">
            <ul>
              <li id="facebook"><a href="https://www.facebook.com/SensebeDictionary-100848441527679/" target="_sub"><img src="image/facebook-icon.png" class="favicon" alt="Facebook link"> facebook</a></li>
              <li id="instagram"><a href="https://www.instagram.com/sensebecommon/" target="_sub"><img src="image/instagram-icon.png" alt="instagram link" class="favicon"> instagram</a></li>
              <li id="youtube"><a href="https://www.youtube.com/channel/UCrbT-np-JDqcwe4fZbwTPNg" target="_sub"><img src="image/youtube-icon.png" alt="youtube link" class="favicon"> youtube</a></li>
            </ul>
          </nav>
          <nav id="top_nav">
            <ul>
              <li id="volume_nav"></li>
              <li id="usage_nav"></li>
              <li id="video_nav"></li>
            </ul>
            <script>
              fetch("${TARGET}/DB_status").then(response => response.json().then(status => {
                document.getElementById('volume_nav').innerHTML = "volumes : " + status["volumes"]
                document.getElementById('usage_nav').innerHTML = "usages : " + status["usages"]
                document.getElementById('video_nav').innerHTML = "videos : " + status["videos"]
              }))
            </script>
          </nav>
          <nav id="right_nav">
            <ul>
              <li><a href="/test"><img src="image/gmail-icon.png" alt="subscribe" class="favicon"> 구독하기</a></li>
              <li class="hidden">후원하기</li>
            </ul>
          </nav>
        </header>
      </div> <!-- head -->
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
      <script text="javascript">
        ${this.autocomplete}
        <!-- DYNAMIC -->
      </script>
    </div> <!-- whole_wrapper -->
  </body>
</html>
          `
    return template
  }

  // find a static page and send
  // now this function is deprecated.
  this.assembleStaticHTML = function(res, dir, page) {
    // console.log('requested page : ' + page)

    var _dir = 'public/html'
    if (dir !== "")
      _dir += '/' + dir

    metadata = this.templateJson[page]
    that = this

    if (metadata) {
      this.fs.readFile(_dir+'/'+page+'.html', 'utf8', function(err, html){
        var template = that.getTemplate(page, html)

        res.send(template)
      })
    } else {
      res.status(404)
      // this.assembleStaticHTML(res, '', 'home')
      console.log("something wrong! page : " + page)
    }
  }

  // for search
  this.assembleSearchHTML = function(res, searchTarget) {
    that = this
    that.fs.readFile('public/html/search.html', 'utf8', function(err, html){
      that.fs.readFile('metadata/script_search.js', 'utf8', function(err, js){
        var template = that.getTemplate("search", html)
        
        js = replaceAll(js, "${TARGET}", TARGET)
        js = replaceAll(js, "${searchTarget}", searchTarget)
        template = template.replace('<!-- DYNAMIC -->', js+that.cytoscape)

        res.send(template)
      })
    })
  }
}
