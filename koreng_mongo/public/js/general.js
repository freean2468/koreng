// client side
document.write('<link rel="stylesheet" type="text/css" href="style/style.css" />');

//
// general control
//
$("#title").click(function() {
    window.location.href = '/';
});

$(document).on('keypress', function(event) {
    if (event.which == 13) {
        onSearchWithFilter();
        $("#searchForm").submit();
    }
});
