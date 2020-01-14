
        // expres
        const express = require('express')
        const app = express()

        // third-party
        const compression = require('compression')
        const bodyParser = require('body-parser')
        const helmet = require('helmet')

        // built-in
        const fs = require('fs')

        // custom
        const HTMLLoader = require('./feature/HTMLLoader.js')
        const HTMLLoaderInst = new HTMLLoader()
        const dataLoader = require('./feature/dataLoader.js')
        const dataLoaderInst = new dataLoader()

        // heroku
        const PORT = process.env.PORT || 5000

        // middlewares
        app.use(express.static('public'))
        app.use(helmet())
        app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
            extended: true
        }))
        app.use(compression())
        
        // Home
        app.get('/', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html','home'))
        app.get("/main_toddler", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/1_toddler", "main_toddler"))
        app.get("/main_feelingmap", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap", "main_feelingmap"))
        app.get("/main_titlemap", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_titlemap", "main_titlemap"))
        app.get("/main_verbmap", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap", "main_verbmap"))
        app.get("/main_game", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_game", "main_game"))
        app.get("/sub_happy", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/happy", "sub_happy"))
        app.get("/sub_happy_cy", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/happy", "sub_happy_cy"))
        app.get("/sub_kind", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/kind", "sub_kind"))
        app.get("/sub_kind_cy", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/kind", "sub_kind_cy"))
        app.get("/sub_angry", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/angry", "sub_angry"))
        app.get("/sub_angry_cy", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/angry", "sub_angry_cy"))
        app.get("/sub_sorry", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/sorry", "sub_sorry"))
        app.get("/sub_sorry_cy", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/sorry", "sub_sorry_cy"))
        app.get("/sub_brother", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_titlemap/brother", "sub_brother"))
        app.get("/sub_brother_cy", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_titlemap/brother", "sub_brother_cy"))
        app.get("/sub_change", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/change", "sub_change"))
        app.get("/sub_change_cy", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/change", "sub_change_cy"))
        app.get("/sub_hate", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/hate", "sub_hate"))
        app.get("/sub_hate_cy", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/hate", "sub_hate_cy"))
        app.get("/sub_leave", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/leave", "sub_leave"))
        app.get("/sub_leave_cy", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/leave", "sub_leave_cy"))
        app.get("/sub_to-be", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/to-be", "sub_to-be"))
        app.get("/sub_to-be_cy", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/to-be", "sub_to-be_cy"))
        app.get("/sub_zelda-oot", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_game/1_zelda-oot", "sub_zelda-oot"))
        app.get("/sub_zelda-mm", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_game/2_zelda-mm", "sub_zelda-mm"))
        app.get("/side_happy-as-clams", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/happy/happy-as-clams", "side_happy-as-clams"))
        app.get("/side_benevolent", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/kind/benevolent", "side_benevolent"))
        app.get("/side_atone", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/sorry/atone", "side_atone"))
        app.get("/side_brethren", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_titlemap/brother/brethren", "side_brethren"))
        app.get("/side_alter", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/change/alter", "side_alter"))
        app.get("/side_alteration", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/change/alteration", "side_alteration"))
        app.get("/side_abhor", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/hate/abhor", "side_abhor"))
        app.get("/side_bugger-off", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/leave/bugger-off", "side_bugger-off"))
        app.get("/side_go-away", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/leave/go-away", "side_go-away"))
        app.get("/side_bode", (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/to-be/bode", "side_bode"))
        // Search
        app.get('/search', (req, res) => onSearch(req, res))

        // app.post('/filter_process', (req, res) => res.send(onSearchWithFilter(req, res)))
        // app.get('/filter', (req, res) => res.send(HTMLLoaderInst.resultHandlingForFilter(dataLoaderInst.metaData)))

        app.use(function(req, res, next) {
            res.status(404)
            HTMLLoaderInst.assembleHTML(res, 'public/html', 'home')
            console.log("something wrong!")
        });
        
        app.use(function (err, req, res, next) {
            console.error(err.stack)
            res.status(500).send('Something broke!')
        });

        app.listen(PORT, () => console.log(`agjac on port ${PORT}!`))

        //
        // functions
        //
        function onSearch(req, res) {
            function arrayRemove(arr, value) {
                return arr.filter(function(ele) {
                return ele != value;
                });
            }
            
            const searchTarget = req.query.target

            // const filterCategory = arrayRemove(req.query.filterCategory.replace(/';;'/g, ';').split(';'), '')
            // const filterContents = arrayRemove(req.query.filterContents.replace(/';;'/g, ';').split(';'), '')

            // nothing to search
            if (searchTarget === undefined || searchTarget.length === 0 || searchTarget.replace(/\s/g, '') === '') {
                return HTMLLoaderInst.assembleHTML(res, 'public/html', 'home');
            // something to search
            } else {
                // const result = dataLoaderInst.searchData(searchTarget, filterCategory, filterContents);
                const result = dataLoaderInst.searchData(searchTarget, '', '');

                // const resultTotalCount = result.resultTotalCount;

                return HTMLLoaderInst.assembleSearchResultHTML(res, searchTarget, result, dataLoaderInst.metaData);
            }
        }