var fs = require('fs');

module.exports = {
  HTML: function(description) {
    var control = '';

    control = `
            <a href="/search">Search</a>
            `;

    return `<!doctype html>
  <html>
  <head>
    <title>영어소비법</title>
    <meta charset="utf-8">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>

    <script type="text/javascript">
      var userAgent = window.navigator.userAgent,
          platform = window.navigator.platform,
          macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
          windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
          iosPlatforms = ['iPhone', 'iPad', 'iPod'];

      if (macosPlatforms.indexOf(platform) !== -1) {
        const iPad = (userAgent.match(/(iPad)/) /* iOS pre 13 */ ||
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) /* iPad OS 13 */);
        if (iPad) {
          document.write('<link rel="stylesheet" type="text/css" href="styleiOS.css" />');
        } else {
          document.write('<link rel="stylesheet" type="text/css" href="styleMacOS.css" />');
        }
      } else if (iosPlatforms.indexOf(platform) !== -1) {
        document.write('<link rel="stylesheet" type="text/css" href="styleiOS.css" />');
      } else if (windowsPlatforms.indexOf(platform) !== -1) {
        document.write('<link rel="stylesheet" type="text/css" href="styleWindows.css" />');
      } else if (/Android/.test(userAgent)) {
        document.write('<link rel="stylesheet" type="text/css" href="styleAndroid.css" />');
      } else if (!os && /Linux/.test(platform)) {
        document.write('<link rel="stylesheet" type="text/css" href="styleLinux.css" />');
      }

      $(function() {
        $("#title").click(function() {
          window.location.href = '/';
        });

        $(".resBlockHeader").click(function() {
          var id = $(this).attr("id");
          $("#resBlockBody_" + id).slideToggle("slow");

          var text = $("#minimizeButton_" + id).text();
          if (text === '+')
            $("#minimizeButton_" + id).text('-');
          else
            $("#minimizeButton_" + id).text('+');
        });

        $(document).on('keypress', function(event) {
          if (event.which == 13) {
            $("#searchForm").submit();
          }
        });
      });
    </script>
  </head>
  <body>
    <div id="bg">
      <div id="title">영어소비법 - 영어는 일상이다 일상은 영어다 -</div>

      <div id="goGroup">
        <div id="searchBox"></div>
        <div id="goBox"></div>

        <form action="search_process" method="post" id="searchForm" >
          <textarea type="hidden" name="search" id="searchText" autofocus="autofocus"></textarea>
          <input type="submit" id="goButton" value="go" />
        </form>
      </div>
      <div id="resultBox" style="color:#FFFFFF; font-size:22px">${description}</div>
    </div>
  </body>
  </html>
  `;
  }
};
