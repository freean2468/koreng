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
    <link rel="stylesheet" type="text/css" href="/style.css" media="screen">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script>
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
    <div>
      <div id="title">영어소비법 - 영어는 일상이다 일상은 영어다 -</div>

      <div id="goGroup">
        <div id="searchBox"></div>
        <div id="goBox"></div>

        <form action="search_process" method="post" id="searchForm" >
          <textarea type="hidden" name="search" id="searchText" autofocus="autofocus"></textarea>
          <input type="submit" id="goButton" value="go" />
        </form>
      </div>
      <div id="resultBox" style="color:#FFFFFF">${description}</div>
    </div>
  </body>
  </html>
  `;
  }
};
