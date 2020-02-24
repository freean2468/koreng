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

function onSearchWithFilter () {
    let category = Cookies.get('category'),
        contents = Cookies.get('contents');
    Cookies.set('search', document.getElementById("searchText").value);
    if(!category) category = '';
    if(!contents) contents = '';
    document.getElementById("filterCategoryInput").value = category;
    document.getElementById("filterContentsInput").value = contents;
}