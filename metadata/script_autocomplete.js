const params = 'presearch?target='

new Autocomplete('#autocomplete', {
    search: input => {
        const url = "TARGET"+"/"+params+encodeURI(input)
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
        location.href="TARGET"+"/search?target="+result.search;
    }
})