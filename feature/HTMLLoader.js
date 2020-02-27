module.exports = HTMLLoader

const PORT = "http://localhost:5000"

// HTMLLoader manages the ways of loading html files.
function HTMLLoader() {
  this.fs = require('fs')
  this.pt = require('path')
  this.templateJson = JSON.parse(this.fs.readFileSync("metadata/HTMLTemplate.json", 'utf8'))
  this.autocomplete = this.fs.readFileSync("metadata/script_autocomplete.js", 'utf8')
  this.cytoscape = this.fs.readFileSync("metadata/script_cytoscape.js", 'utf8')

  this.getTemplate = function (page, html) {
    const metadata = this.templateJson[page]
    var template = `
<!doctype html>
<html>
  <head>
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
  </head>
  <body id="index" class="no_sidebar">
    <div id="whole_wrapper">
      <div class="head">
        <header>
          <hgroup>
            <p class="title"><a href="${PORT}">SensebeDictionary ver.Beta</a></p>
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
                    <!--<li class="selected">-->
                    <div class="label public">
                      <a class="pagelink" href="${PORT}/main_toddler">첫걸음</a>
                    </div>
                    <div class="sub_nav depth_1" style="left: -51px; position: absolute; width: 199px; display: none;" loaded="true">
                      <ul class="sub_nav">
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </nav>
          </hgroup> <!-- hgroup -->
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

        function replaceAll(str, searchStr, replaceStr) {
          return str.split(searchStr).join(replaceStr);
        }
        
        js = replaceAll(js, "${PORT}", PORT)
        js = replaceAll(js, "${searchTarget}", searchTarget)
        template = template.replace('<!-- DYNAMIC -->', js+that.cytoscape)

        res.send(template)
      })
    })
  }
}
