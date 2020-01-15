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
  this.assembleSearchResultHTML = function(res, searchTarget, result, metaData) {
    this.fs.readFile('public/html/search.html', 'utf8', function(err, head){
      var HTML=head;

      const resTotalCount = result.resultTotalCount;
      const resList = result.resObjList;
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

  //
  //  Filter
  //
  this.resultHandlingForFilter = function(metaData) {
    var temp = '';

    temp += `<div>
            <span id="filterConfirmButton">Confirm</span><br><br>`;
    // enumerate metaData
    for (const content in metaData) {
      const _content = metaData[content];
      temp += `<div>
              <div class="filterBlock" id="${content}">#${content}</div>`;
      for (let i = 0; i < _content.length; ++i) {
        const _noSpace = _content[i].replace(/\s/g, '_');
        temp += `<div class="filterTriggerButton" id="${_noSpace}" target="${content}">< ${_content[i]} ></div>`;
      }
      temp += `</div><br>`
    }
    //div close
    temp += `</div><br>`;

    return this.filterHTML(temp);
  }

  this.filterHTML = function(description) {
    return `<!doctype html>
            <html>
            <head>
              <title></title>
              <meta charset="utf-8">
              <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
              <script src="https://cdn.jsdelivr.net/npm/js-cookie@beta/dist/js.cookie.min.js"></script>

              <script type="text/javascript">
                // client side
                const userAgent = window.navigator.userAgent,
                    platform = window.navigator.platform,
                    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
                    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
                    iosPlatforms = ['iPhone', 'iPad', 'iPod'];

                if (macosPlatforms.indexOf(platform) !== -1) {
                  const iPad = (userAgent.match(/(iPad)/) /* iOS pre 13 */ ||
                              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) /* iPad OS 13 */);
                  if (iPad) {
                    document.write('<link rel="stylesheet" type="text/css" href="style/tyleiOS.css" />');
                  } else {
                    document.write('<link rel="stylesheet" type="text/css" href="style/styleMacOS.css" />');
                  }
                } else if (iosPlatforms.indexOf(platform) !== -1) {
                  document.write('<link rel="stylesheet" type="text/css" href="style/styleiOS.css" />');
                } else if (windowsPlatforms.indexOf(platform) !== -1) {
                  document.write('<link rel="stylesheet" type="text/css" href="style/styleWindows.css" />');
                } else if (/Android/.test(userAgent)) {
                  document.write('<link rel="stylesheet" type="text/css" href="style/styleAndroid.css" />');
                } else if (!os && /Linux/.test(platform)) {
                  document.write('<link rel="stylesheet" type="text/css" href="style/styleLinux.css" />');
                }

                function addFilterCookie(id, value) {
                  let cookie = Cookies.get(id);
                  if (cookie !== undefined) {
                    Cookies.set(id, cookie+';'+value+';');
                  } else {
                    Cookies.set(id, ';'+value+';');
                  }
                }

                function removeFilterCookie(id, value) {
                  let cookie = Cookies.get(id);
                  cookie = replaceAll(cookie, ';'+value+';', '');
                  if (cookie !== undefined && cookie !== '') {
                    Cookies.set(id, cookie);
                  } else {
                    Cookies.remove(id);
                  }
                }

                function replaceAll(str, searchStr, replaceStr) {
                  return str.split(searchStr).join(replaceStr);
                }

                $(function() {
                  $(".filterBlock").click(function() {
                    const id = $(this).attr("id");
                    $(".filterTriggerButton[target="+id+"]").slideToggle("slow");

                    if ($(this).css("opacity") === '1') {
                      addFilterCookie('category', id);
                      $(this).css({opacity:0.5});
                    } else {
                      removeFilterCookie('category', id);
                      $(this).css({opacity:1});
                    }
                  });

                  $(".filterTriggerButton").click(function() {
                    const id = $(this).attr("id");
                    let val = replaceAll(id, '_', ' ');

                    if ($(this).css("opacity") === '1') {
                      addFilterCookie('contents', val);
                      $(this).css({opacity:0.5});
                    } else {
                      removeFilterCookie('contents', val);
                      $(this).css({opacity:1});
                    }
                  });

                  $("#filterConfirmButton").click(function() {
                    let search = Cookies.get('search'),
                        category = Cookies.get('category'),
                        contents = Cookies.get('contents');

                    if(!category) category = '';
                    if(!contents) contents = '';

                    document.getElementById("filterSearchInput").value = search;
                    document.getElementById("filterCategoryInput").value = category;
                    document.getElementById("filterContentsInput").value = contents;
                    $("#filterForm").submit();
                  });
                });
              </script>
            </head>
            <body>
              <div>
                <div id="filterBox" style="color:#FFFFFF"; font-size:22px">${description}</div>
                <script>
                  let category = Cookies.get('category'),
                      contents = Cookies.get('contents');

                  if (category !== undefined) {
                    category = replaceAll(Cookies.get('category'),';;',';').split(';');
                    for (var i in category) {
                      if(category[i] !== '') {
                        $(".filterTriggerButton[target="+category[i]+"]").slideToggle(0);
                        $("#"+category[i]).css({opacity:0.5});
                      }
                    }
                  }

                  if (contents !== undefined) {
                    contents = replaceAll(Cookies.get('contents'),';;',';').split(';');
                    for (var i in contents) {
                      if(contents[i] !== '') {
                        const _noSpace = "#"+replaceAll(contents[i],' ', '_');
                        $(_noSpace).css({opacity:0.5});
                      }
                    }
                  }
                </script>
                <div>
                  <form id="filterForm" action="filter_process" method="post">
                    <textarea style="display: none;" name="search" id="filterSearchInput"></textarea>
                    <textarea style="display: none;" name="filterCategory" id="filterCategoryInput"></textarea>
                    <textarea style="display: none;" name="filterContents" id="filterContentsInput"></textarea>
                    <input type="hidden"/>
                  </form>
                </div>
              </div>
            </body>
            </html>
            `;
  }
}
