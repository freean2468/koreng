//
// search AJAX fetch codes for a client-side web brower
// This code will be loaded from HTMLLoader
//

// TARGEt will be replaced to appropriate URL in the HTMLLoader
fetch("${TARGET}/cy?target=${searchTarget}").then(response => response.json().then(json => {
    <!-- MAKECY -->
}));