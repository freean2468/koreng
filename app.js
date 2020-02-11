
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
const mongoClient = require('./feature/mongoClient.js')
const mongoClientInst = new mongoClient()

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
app.get("/" + encodeURIComponent("main_placemap"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_placemap", "main_placemap"))
app.get("/" + encodeURIComponent("main_game"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_game", "main_game"))

// Sub
app.get("/" + encodeURIComponent("sub_place"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_placemap/place", "sub_place"))
app.get("/" + encodeURIComponent("sub_zelda-oot"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_game/1_zelda-oot", "sub_zelda-oot"))
app.get("/" + encodeURIComponent("sub_zelda-mm"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_game/2_zelda-mm", "sub_zelda-mm"))

// Side
app.get("/" + encodeURIComponent("side_area"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_placemap/place/area", "side_area"))

// image
app.get("/Can_not_hack_it_1.jpg", (req, res) => res.sendFile("/public/image/Can_not_hack_it_1.jpg", { root : __dirname}))
app.get("/a_cut_above_1.png", (req, res) => res.sendFile("/public/image/a_cut_above_1.png", { root : __dirname}))
app.get("/aglow_1.png", (req, res) => res.sendFile("/public/image/aglow_1.png", { root : __dirname}))
app.get("/amnesia_1.png", (req, res) => res.sendFile("/public/image/amnesia_1.png", { root : __dirname}))
app.get("/aptitude_1.png", (req, res) => res.sendFile("/public/image/aptitude_1.png", { root : __dirname}))
app.get("/awash_1.png", (req, res) => res.sendFile("/public/image/awash_1.png", { root : __dirname}))
app.get("/barb_1.png", (req, res) => res.sendFile("/public/image/barb_1.png", { root : __dirname}))
app.get("/be_better_off_1.png", (req, res) => res.sendFile("/public/image/be_better_off_1.png", { root : __dirname}))
app.get("/beachcomb_1.png", (req, res) => res.sendFile("/public/image/beachcomb_1.png", { root : __dirname}))
app.get("/brag_1.png", (req, res) => res.sendFile("/public/image/brag_1.png", { root : __dirname}))
app.get("/buffet_1.png", (req, res) => res.sendFile("/public/image/buffet_1.png", { root : __dirname}))
app.get("/bushed_1.png", (req, res) => res.sendFile("/public/image/bushed_1.png", { root : __dirname}))
app.get("/by_your_lonesome_1.png", (req, res) => res.sendFile("/public/image/by_your_lonesome_1.png", { root : __dirname}))
app.get("/chowder_1.png", (req, res) => res.sendFile("/public/image/chowder_1.png", { root : __dirname}))
app.get("/christen_1.png", (req, res) => res.sendFile("/public/image/christen_1.png", { root : __dirname}))
app.get("/confer_1.jpg", (req, res) => res.sendFile("/public/image/confer_1.jpg", { root : __dirname}))
app.get("/contender_1.png", (req, res) => res.sendFile("/public/image/contender_1.png", { root : __dirname}))
app.get("/curb_1.png", (req, res) => res.sendFile("/public/image/curb_1.png", { root : __dirname}))
app.get("/dawdle_1.jpg", (req, res) => res.sendFile("/public/image/dawdle_1.jpg", { root : __dirname}))
app.get("/defiant_1.jpg", (req, res) => res.sendFile("/public/image/defiant_1.jpg", { root : __dirname}))
app.get("/despicably_1.png", (req, res) => res.sendFile("/public/image/despicably_1.png", { root : __dirname}))
app.get("/dissuade_1.png", (req, res) => res.sendFile("/public/image/dissuade_1.png", { root : __dirname}))
app.get("/douse_1.png", (req, res) => res.sendFile("/public/image/douse_1.png", { root : __dirname}))
app.get("/down_1.png", (req, res) => res.sendFile("/public/image/down_1.png", { root : __dirname}))
app.get("/duff_1.png", (req, res) => res.sendFile("/public/image/duff_1.png", { root : __dirname}))
app.get("/envision_1.png", (req, res) => res.sendFile("/public/image/envision_1.png", { root : __dirname}))
app.get("/exploit_1.png", (req, res) => res.sendFile("/public/image/exploit_1.png", { root : __dirname}))
app.get("/fancy_1.jpg", (req, res) => res.sendFile("/public/image/fancy_1.jpg", { root : __dirname}))
app.get("/feat_1.png", (req, res) => res.sendFile("/public/image/feat_1.png", { root : __dirname}))
app.get("/fed_up_1.jpg", (req, res) => res.sendFile("/public/image/fed_up_1.jpg", { root : __dirname}))
app.get("/fiddle_with_sth_1.png", (req, res) => res.sendFile("/public/image/fiddle_with_sth_1.png", { root : __dirname}))
app.get("/flash_1.jpg", (req, res) => res.sendFile("/public/image/flash_1.jpg", { root : __dirname}))
app.get("/flit_1.jpg", (req, res) => res.sendFile("/public/image/flit_1.jpg", { root : __dirname}))
app.get("/forage_1.png", (req, res) => res.sendFile("/public/image/forage_1.png", { root : __dirname}))
app.get("/fork_over_sth_1.png", (req, res) => res.sendFile("/public/image/fork_over_sth_1.png", { root : __dirname}))
app.get("/frivolous_1.png", (req, res) => res.sendFile("/public/image/frivolous_1.png", { root : __dirname}))
app.get("/from_the_top_down_1.png", (req, res) => res.sendFile("/public/image/from_the_top_down_1.png", { root : __dirname}))
app.get("/fussy_1.jpg", (req, res) => res.sendFile("/public/image/fussy_1.jpg", { root : __dirname}))
app.get("/get_by_1.png", (req, res) => res.sendFile("/public/image/get_by_1.png", { root : __dirname}))
app.get("/get_down_to_sth_1.jpg", (req, res) => res.sendFile("/public/image/get_down_to_sth_1.jpg", { root : __dirname}))
app.get("/getaway_1.png", (req, res) => res.sendFile("/public/image/getaway_1.png", { root : __dirname}))
app.get("/give_a_hoot_1.jpg", (req, res) => res.sendFile("/public/image/give_a_hoot_1.jpg", { root : __dirname}))
app.get("/glutton_1.jpg", (req, res) => res.sendFile("/public/image/glutton_1.jpg", { root : __dirname}))
app.get("/goof_1.png", (req, res) => res.sendFile("/public/image/goof_1.png", { root : __dirname}))
app.get("/hand-in-hand_1.png", (req, res) => res.sendFile("/public/image/hand-in-hand_1.png", { root : __dirname}))
app.get("/haul_1.png", (req, res) => res.sendFile("/public/image/haul_1.png", { root : __dirname}))
app.get("/haul_2.png", (req, res) => res.sendFile("/public/image/haul_2.png", { root : __dirname}))
app.get("/hayseed_1.png", (req, res) => res.sendFile("/public/image/hayseed_1.png", { root : __dirname}))
app.get("/hew_1.png", (req, res) => res.sendFile("/public/image/hew_1.png", { root : __dirname}))
app.get("/ignorant_1.png", (req, res) => res.sendFile("/public/image/ignorant_1.png", { root : __dirname}))
app.get("/inflate_1.png", (req, res) => res.sendFile("/public/image/inflate_1.png", { root : __dirname}))
app.get("/insolent_1.jpg", (req, res) => res.sendFile("/public/image/insolent_1.jpg", { root : __dirname}))
app.get("/itching_to_do_sth_1.jpg", (req, res) => res.sendFile("/public/image/itching_to_do_sth_1.jpg", { root : __dirname}))
app.get("/link_sth_up_1.png", (req, res) => res.sendFile("/public/image/link_sth_up_1.png", { root : __dirname}))
app.get("/listen_in_on_sb_1.jpg", (req, res) => res.sendFile("/public/image/listen_in_on_sb_1.jpg", { root : __dirname}))
app.get("/make_the_grade_1.png", (req, res) => res.sendFile("/public/image/make_the_grade_1.png", { root : __dirname}))
app.get("/measure_up_1.jpg", (req, res) => res.sendFile("/public/image/measure_up_1.jpg", { root : __dirname}))
app.get("/mend_1.png", (req, res) => res.sendFile("/public/image/mend_1.png", { root : __dirname}))
app.get("/might_as_well_1.jpg", (req, res) => res.sendFile("/public/image/might_as_well_1.jpg", { root : __dirname}))
app.get("/nibble_1.png", (req, res) => res.sendFile("/public/image/nibble_1.png", { root : __dirname}))
app.get("/nifty_1.png", (req, res) => res.sendFile("/public/image/nifty_1.png", { root : __dirname}))
app.get("/patronize_1.jpg", (req, res) => res.sendFile("/public/image/patronize_1.jpg", { root : __dirname}))
app.get("/pit_sb_against_sb_1.jpg", (req, res) => res.sendFile("/public/image/pit_sb_against_sb_1.jpg", { root : __dirname}))
app.get("/pitch_1.png", (req, res) => res.sendFile("/public/image/pitch_1.png", { root : __dirname}))
app.get("/plod_1.jpg", (req, res) => res.sendFile("/public/image/plod_1.jpg", { root : __dirname}))
app.get("/poacher_1.png", (req, res) => res.sendFile("/public/image/poacher_1.png", { root : __dirname}))
app.get("/prodigy_1.png", (req, res) => res.sendFile("/public/image/prodigy_1.png", { root : __dirname}))
app.get("/pull_1.jpg", (req, res) => res.sendFile("/public/image/pull_1.jpg", { root : __dirname}))
app.get("/punch_1.png", (req, res) => res.sendFile("/public/image/punch_1.png", { root : __dirname}))
app.get("/puny_1.jpg", (req, res) => res.sendFile("/public/image/puny_1.jpg", { root : __dirname}))
app.get("/rake_sth_in_1.png", (req, res) => res.sendFile("/public/image/rake_sth_in_1.png", { root : __dirname}))
app.get("/ravishing_1.jpg", (req, res) => res.sendFile("/public/image/ravishing_1.jpg", { root : __dirname}))
app.get("/retreat_1.png", (req, res) => res.sendFile("/public/image/retreat_1.png", { root : __dirname}))
app.get("/right_up_arrow.png", (req, res) => res.sendFile("/public/image/right_up_arrow.png", { root : __dirname}))
app.get("/ring_1.png", (req, res) => res.sendFile("/public/image/ring_1.png", { root : __dirname}))
app.get("/setback_1.png", (req, res) => res.sendFile("/public/image/setback_1.png", { root : __dirname}))
app.get("/shin_1.png", (req, res) => res.sendFile("/public/image/shin_1.png", { root : __dirname}))
app.get("/skyscraper_1.png", (req, res) => res.sendFile("/public/image/skyscraper_1.png", { root : __dirname}))
app.get("/slushie_1.png", (req, res) => res.sendFile("/public/image/slushie_1.png", { root : __dirname}))
app.get("/smack_1.png", (req, res) => res.sendFile("/public/image/smack_1.png", { root : __dirname}))
app.get("/sneak_up_on_sb_1.jpg", (req, res) => res.sendFile("/public/image/sneak_up_on_sb_1.jpg", { root : __dirname}))
app.get("/snoop_1.png", (req, res) => res.sendFile("/public/image/snoop_1.png", { root : __dirname}))
app.get("/spelunking_1.png", (req, res) => res.sendFile("/public/image/spelunking_1.png", { root : __dirname}))
app.get("/spur_1.png", (req, res) => res.sendFile("/public/image/spur_1.png", { root : __dirname}))
app.get("/strike_fear_into_sb_1.jpg", (req, res) => res.sendFile("/public/image/strike_fear_into_sb_1.jpg", { root : __dirname}))
app.get("/sweat_1.png", (req, res) => res.sendFile("/public/image/sweat_1.png", { root : __dirname}))
app.get("/take_it_out_of_sb_1.jpg", (req, res) => res.sendFile("/public/image/take_it_out_of_sb_1.jpg", { root : __dirname}))
app.get("/take_sb_on_1.jpg", (req, res) => res.sendFile("/public/image/take_sb_on_1.jpg", { root : __dirname}))
app.get("/take_sb_on_2.jpg", (req, res) => res.sendFile("/public/image/take_sb_on_2.jpg", { root : __dirname}))
app.get("/take_sth_out_on_sb_1.png", (req, res) => res.sendFile("/public/image/take_sth_out_on_sb_1.png", { root : __dirname}))
app.get("/tang_1.png", (req, res) => res.sendFile("/public/image/tang_1.png", { root : __dirname}))
app.get("/therapeutic_1.png", (req, res) => res.sendFile("/public/image/therapeutic_1.png", { root : __dirname}))
app.get("/throw_sth_off_1.jpg", (req, res) => res.sendFile("/public/image/throw_sth_off_1.jpg", { root : __dirname}))
app.get("/tickle_1.png", (req, res) => res.sendFile("/public/image/tickle_1.png", { root : __dirname}))
app.get("/tizzy_1.png", (req, res) => res.sendFile("/public/image/tizzy_1.png", { root : __dirname}))
app.get("/torpedo_1.png", (req, res) => res.sendFile("/public/image/torpedo_1.png", { root : __dirname}))
app.get("/treacherous_1.png", (req, res) => res.sendFile("/public/image/treacherous_1.png", { root : __dirname}))
app.get("/tremor_1.png", (req, res) => res.sendFile("/public/image/tremor_1.png", { root : __dirname}))
app.get("/triathlon_1.png", (req, res) => res.sendFile("/public/image/triathlon_1.png", { root : __dirname}))
app.get("/uproar_1.png", (req, res) => res.sendFile("/public/image/uproar_1.png", { root : __dirname}))
app.get("/waggle_1.png", (req, res) => res.sendFile("/public/image/waggle_1.png", { root : __dirname}))
app.get("/web_1.png", (req, res) => res.sendFile("/public/image/web_1.png", { root : __dirname}))
app.get("/when_the_chips_are_down_1.jpg", (req, res) => res.sendFile("/public/image/when_the_chips_are_down_1.jpg", { root : __dirname}))
app.get("/whittle_1.png", (req, res) => res.sendFile("/public/image/whittle_1.png", { root : __dirname}))
app.get("/wimp_out_1.png", (req, res) => res.sendFile("/public/image/wimp_out_1.png", { root : __dirname}))
app.get("/wimpy_1.png", (req, res) => res.sendFile("/public/image/wimpy_1.png", { root : __dirname}))

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

try {
    app.listen(PORT, () => console.log(`agjac on port ${PORT}!`))
} catch (e) {
    console.error(e)
} finally {
    mongoClientInst.close()
}

//
// functions
//
async function onSearch(req, res) {
    function arrayRemove(arr, value) {
        return arr.filter(function(ele) {
        return ele != value;
        });
    }
    
    const searchTarget = req.query.target

    // let [foo, bar] = await Promise.all([getFoor(), getBar()]);
    // mongoRes = mongoClientInst.findOneListingById(searchTarget)
    //             .then(function(v){
    //                     console.log('success!', v)
    //                 },
    //                 function(v){
    //                     console.log('failure', v)
    //                 }
    //             )
    // console.log('mongoRes : ',mongoRes)

    console.log(searchTarget)
    let mongoRes = await mongoClientInst.findOneListingById(searchTarget)
    
    if (mongoRes) {
        // searchRes = dataLoaderInst.searchData(searchTarget, '', '');
        // console.log(searchRes)
        searchRes = {
            resultTotalCount: 0,
            resObjList: []
        }
        console.log(searchRes)

        return HTMLLoaderInst.assembleSearchResultHTML(res, searchTarget, mongoRes, searchRes, dataLoaderInst.metaData);
    } else {
        return HTMLLoaderInst.assembleHTML(res, 'public/html', 'home');
    }
    // const filterCategory = arrayRemove(req.query.filterCategory.replace(/';;'/g, ';').split(';'), '')
    // const filterContents = arrayRemove(req.query.filterContents.replace(/';;'/g, ';').split(';'), '')

    // nothing to search
    // if (searchTarget === undefined || searchTarget.length === 0 || searchTarget.replace(/\s/g, '') === '') {
    //     return HTMLLoaderInst.assembleHTML(res, 'public/html', 'home');
    // // something to search
    // } else {
    //     // const result = dataLoaderInst.searchData(searchTarget, filterCategory, filterContents);
        // result = dataLoaderInst.searchData(searchTarget, '', '');

        // // const resultTotalCount = result.resultTotalCount;

        // return HTMLLoaderInst.assembleSearchResultHTML(res, searchTarget, result, dataLoaderInst.metaData);
    // }
}