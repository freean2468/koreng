const URL = 'http://localhost:5200'
const params = 'presearch?target='

new Autocomplete('#autocomplete', {
    search: input => {
        const url = URL+"/"+params+encodeURI(input)

        return new Promise(resolve => {
        if (input.length < 1) {
            return resolve([])
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                resolve(data)
            })
        })
    },

    getResultValue: result => result.search,

    onSubmit: result => {
        location.href=URL+"/search?target="+result.search;
    }
})