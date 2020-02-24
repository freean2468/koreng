// control
$(function() {
    //
    // search control
    //
    $(".res_block_H").click(function() {
        var id = $(this).attr("id");
        $("#res_block_B" + id).slideToggle("slow");

        if ($(this).css("opacity") === '1')
          $(this).css({opacity:0.5});
        else
          $(this).css({opacity:1});

        var text = $("#minimizeButton_" + id).text();
        if (text === '+')
            $("#minimizeButton_" + id).text('-');
        else
            $("#minimizeButton_" + id).text('+');
    });

    //
    // filter control
    //
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
});

//
// for filter
//
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