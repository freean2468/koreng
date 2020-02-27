// const wikiUrl = 'https://en.wikipedia.org'
// const params = 'action=query&list=search&format=json&origin=*'

// new Autocomplete('#autocomplete', {
//     // Search function can return a promise which resolves with an array of
//     // results. In this case we're using the Wikipedia search API.
//     search: input => {
//         const url = wikiUrl+"/w/api.php?"+params+"&srsearch="+encodeURI(input)

//         return new Promise(resolve => {
//         if (input.length < 1) {
//             return resolve([])
//         }

//         fetch(url)
//             .then(response => response.json())
//             .then(data => {
//                 console.log(data.query.search)
//                 resolve(data.query.search)
//             })
//         })
//     },
    
//     // Wikipedia returns a format like this: 
//     // {
//     //   pageid: 12345,
//     //   title: 'Article title',
//     //   ...
//     // } 
//     // We want to display the title
//     getResultValue: result => result.title,

//     // Open the selected article in a new window
//     onSubmit: result => {
//         window.open("wikiUrl"+"/wiki/"+encodeURI(result.title))
//     }
// })

const PORT = process.env.PORT || 5000
const URL = process.env.URL || "http://localhost"
const target = URL + ':' + PORT
const params = 'presearch?target='

new Autocomplete('#autocomplete', {
    search: input => {
        const url = target+"/"+params+encodeURI(input)

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