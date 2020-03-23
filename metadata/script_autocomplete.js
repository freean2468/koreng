//
// Autocomplete library customizing for a client-side web brower
// This code will be loaded from HTMLLoader
//

const params = 'presearch?target='

new Autocomplete('#autocomplete', {
    search: input => {
        // TARGEt will be replaced to URL at the HTMLLoader according to the environment flag
        const url = "TARGET"+"/"+params+encodeURI(input)
        return new Promise(resolve => {
            if (input.length < 1) {
                return resolve([])
        }

        // Using AJAX
        fetch(url)
            .then(response => response.json())
            .then(data => {
                resolve(data)
            })
        })
    },

    getResultValue: result => result.search,

    onSubmit: result => {
        // TARGEt will be replaced to URL at the HTMLLoader according to the environment flag
        location.href="TARGET"+"/search?target="+result.search;
    }
})