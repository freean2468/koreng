
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
        
        // Search
        app.get('/search', (req, res) => onSearch(req, res))

        // Main
        app.get("/" + encodeURIComponent("main_toddler"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/1_toddler", "main_toddler"))
        app.get("/" + encodeURIComponent("main_feelingmap"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap", "main_feelingmap"))
        app.get("/" + encodeURIComponent("main_generalmap"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap", "main_generalmap"))
        app.get("/" + encodeURIComponent("main_verbmap"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap", "main_verbmap"))
        app.get("/" + encodeURIComponent("main_placemap"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap", "main_placemap"))
        app.get("/" + encodeURIComponent("main_game"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/7_game", "main_game"))
        
        // Sub
        app.get("/" + encodeURIComponent("sub_happy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/happy", "sub_happy"))
        app.get("/" + encodeURIComponent("sub_happy_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/happy", "sub_happy_cy"))
        app.get("/" + encodeURIComponent("sub_kind"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/kind", "sub_kind"))
        app.get("/" + encodeURIComponent("sub_kind_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/kind", "sub_kind_cy"))
        app.get("/" + encodeURIComponent("sub_angry"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/angry", "sub_angry"))
        app.get("/" + encodeURIComponent("sub_angry_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/angry", "sub_angry_cy"))
        app.get("/" + encodeURIComponent("sub_sorry"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/sorry", "sub_sorry"))
        app.get("/" + encodeURIComponent("sub_sorry_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/sorry", "sub_sorry_cy"))
        app.get("/" + encodeURIComponent("sub_change"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/change", "sub_change"))
        app.get("/" + encodeURIComponent("sub_change_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/change", "sub_change_cy"))
        app.get("/" + encodeURIComponent("sub_title"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title", "sub_title"))
        app.get("/" + encodeURIComponent("sub_title_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title", "sub_title_cy"))
        app.get("/" + encodeURIComponent("sub_time"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/time", "sub_time"))
        app.get("/" + encodeURIComponent("sub_time_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/time", "sub_time_cy"))
        app.get("/" + encodeURIComponent("sub_thought"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought", "sub_thought"))
        app.get("/" + encodeURIComponent("sub_thought_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought", "sub_thought_cy"))
        app.get("/" + encodeURIComponent("sub_treat"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/treat", "sub_treat"))
        app.get("/" + encodeURIComponent("sub_treat_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/treat", "sub_treat_cy"))
        app.get("/" + encodeURIComponent("sub_to be"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/to be", "sub_to be"))
        app.get("/" + encodeURIComponent("sub_to be_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/to be", "sub_to be_cy"))
        app.get("/" + encodeURIComponent("sub_improve"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/improve", "sub_improve"))
        app.get("/" + encodeURIComponent("sub_improve_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/improve", "sub_improve_cy"))
        app.get("/" + encodeURIComponent("sub_hate"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/hate", "sub_hate"))
        app.get("/" + encodeURIComponent("sub_hate_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/hate", "sub_hate_cy"))
        app.get("/" + encodeURIComponent("sub_leave"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/leave", "sub_leave"))
        app.get("/" + encodeURIComponent("sub_leave_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/leave", "sub_leave_cy"))
        app.get("/" + encodeURIComponent("sub_a place where livings live"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live", "sub_a place where livings live"))
        app.get("/" + encodeURIComponent("sub_a place where livings live_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live", "sub_a place where livings live_cy"))
        app.get("/" + encodeURIComponent("sub_place"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/place", "sub_place"))
        app.get("/" + encodeURIComponent("sub_place_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/place", "sub_place_cy"))
        app.get("/" + encodeURIComponent("sub_zelda-oot"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/7_game/1_zelda-oot", "sub_zelda-oot"))
        app.get("/" + encodeURIComponent("sub_zelda-mm"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/7_game/2_zelda-mm", "sub_zelda-mm"))
        
        // Side
        app.get("/" + encodeURIComponent("side_happy as clams"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/happy/happy as clams", "side_happy as clams"))
        app.get("/" + encodeURIComponent("side_benevolent"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/kind/benevolent", "side_benevolent"))
        app.get("/" + encodeURIComponent("side_atone"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/sorry/atone", "side_atone"))
        app.get("/" + encodeURIComponent("side_makeover"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/change/makeover", "side_makeover"))
        app.get("/" + encodeURIComponent("side_alter"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/change/alter", "side_alter"))
        app.get("/" + encodeURIComponent("side_alteration"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/change/alteration", "side_alteration"))
        app.get("/" + encodeURIComponent("side_brother"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title/brother", "side_brother"))
        app.get("/" + encodeURIComponent("side_brethren"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title/brethren", "side_brethren"))
        app.get("/" + encodeURIComponent("side_leader"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title/leader", "side_leader"))
        app.get("/" + encodeURIComponent("side_messiah"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title/messiah", "side_messiah"))
        app.get("/" + encodeURIComponent("side_long-lost"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/time/long-lost", "side_long-lost"))
        app.get("/" + encodeURIComponent("side_opinion"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/opinon", "side_opinion"))
        app.get("/" + encodeURIComponent("side_have an axe to grind"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/have an axe to grind", "side_have an axe to grind"))
        app.get("/" + encodeURIComponent("side_trifle with"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/treat/trifle with", "side_trifle with"))
        app.get("/" + encodeURIComponent("side_bode"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/to be/bode", "side_bode"))
        app.get("/" + encodeURIComponent("side_spruce up"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/improve/spruce up", "side_spruce up"))
        app.get("/" + encodeURIComponent("side_abhor"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/hate/abhor", "side_abhor"))
        app.get("/" + encodeURIComponent("side_go away"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/leave/go away", "side_go away"))
        app.get("/" + encodeURIComponent("side_bugger off"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/leave/bugger off", "side_bugger off"))
        app.get("/" + encodeURIComponent("side_city"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live/city", "side_city"))
        app.get("/" + encodeURIComponent("side_town"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live/town", "side_town"))
        app.get("/" + encodeURIComponent("side_borough"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live/borough", "side_borough"))
        app.get("/" + encodeURIComponent("side_squalor"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/place/squalor", "side_squalor"))
        
        // image
        app.get("/public/image/right_up_arrow.png", (req, res) => res.sendFile("/public/image/right_up_arrow.png", { root : __dirname}))

        // app.post('/filter_process', (req, res) => res.send(onSearchWithFilter(req, res)))
        // app.get('/filter', (req, res) => res.send(HTMLLoaderInst.resultHandlingForFilter(dataLoaderInst.metaData)))

        app.use(function(req, res, next) {
            res.status(404)
            HTMLLoaderInst.assembleHTML(res, 'public/html', 'home')
            console.log("something wrong! req.url : " + req.url)
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