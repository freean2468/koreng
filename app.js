
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
        app.get("/" + encodeURIComponent("main_game"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/6_game", "main_game"))
        
        // Sub
        app.get("/" + encodeURIComponent("sub_happy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/happy", "sub_happy"))
        app.get("/" + encodeURIComponent("sub_happy_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/happy", "sub_happy_cy"))
        app.get("/" + encodeURIComponent("sub_kind"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/kind", "sub_kind"))
        app.get("/" + encodeURIComponent("sub_kind_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/kind", "sub_kind_cy"))
        app.get("/" + encodeURIComponent("sub_calm"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/calm", "sub_calm"))
        app.get("/" + encodeURIComponent("sub_calm_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/calm", "sub_calm_cy"))
        app.get("/" + encodeURIComponent("sub_angry"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/angry", "sub_angry"))
        app.get("/" + encodeURIComponent("sub_angry_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/angry", "sub_angry_cy"))
        app.get("/" + encodeURIComponent("sub_sorry"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/sorry", "sub_sorry"))
        app.get("/" + encodeURIComponent("sub_sorry_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/sorry", "sub_sorry_cy"))
        app.get("/" + encodeURIComponent("sub_interest"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/interest", "sub_interest"))
        app.get("/" + encodeURIComponent("sub_interest_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/interest", "sub_interest_cy"))
        app.get("/" + encodeURIComponent("sub_change"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/change", "sub_change"))
        app.get("/" + encodeURIComponent("sub_change_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/change", "sub_change_cy"))
        app.get("/" + encodeURIComponent("sub_title"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title", "sub_title"))
        app.get("/" + encodeURIComponent("sub_title_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title", "sub_title_cy"))
        app.get("/" + encodeURIComponent("sub_substance"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/substance", "sub_substance"))
        app.get("/" + encodeURIComponent("sub_substance_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/substance", "sub_substance_cy"))
        app.get("/" + encodeURIComponent("sub_straight"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/straight", "sub_straight"))
        app.get("/" + encodeURIComponent("sub_straight_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/straight", "sub_straight_cy"))
        app.get("/" + encodeURIComponent("sub_act"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act", "sub_act"))
        app.get("/" + encodeURIComponent("sub_act_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act", "sub_act_cy"))
        app.get("/" + encodeURIComponent("sub_state"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/state", "sub_state"))
        app.get("/" + encodeURIComponent("sub_state_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/state", "sub_state_cy"))
        app.get("/" + encodeURIComponent("sub_time"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/time", "sub_time"))
        app.get("/" + encodeURIComponent("sub_time_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/time", "sub_time_cy"))
        app.get("/" + encodeURIComponent("sub_possibility"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/possibility", "sub_possibility"))
        app.get("/" + encodeURIComponent("sub_possibility_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/possibility", "sub_possibility_cy"))
        app.get("/" + encodeURIComponent("sub_object"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/object", "sub_object"))
        app.get("/" + encodeURIComponent("sub_object_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/object", "sub_object_cy"))
        app.get("/" + encodeURIComponent("sub_better"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/better", "sub_better"))
        app.get("/" + encodeURIComponent("sub_better_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/better", "sub_better_cy"))
        app.get("/" + encodeURIComponent("sub_ability"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/ability", "sub_ability"))
        app.get("/" + encodeURIComponent("sub_ability_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/ability", "sub_ability_cy"))
        app.get("/" + encodeURIComponent("sub_thought"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought", "sub_thought"))
        app.get("/" + encodeURIComponent("sub_thought_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought", "sub_thought_cy"))
        app.get("/" + encodeURIComponent("sub_discover"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/discover", "sub_discover"))
        app.get("/" + encodeURIComponent("sub_discover_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/discover", "sub_discover_cy"))
        app.get("/" + encodeURIComponent("sub_say"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/say", "sub_say"))
        app.get("/" + encodeURIComponent("sub_say_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/say", "sub_say_cy"))
        app.get("/" + encodeURIComponent("sub_follow"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/follow", "sub_follow"))
        app.get("/" + encodeURIComponent("sub_follow_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/follow", "sub_follow_cy"))
        app.get("/" + encodeURIComponent("sub_show"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/show", "sub_show"))
        app.get("/" + encodeURIComponent("sub_show_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/show", "sub_show_cy"))
        app.get("/" + encodeURIComponent("sub_treat"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/treat", "sub_treat"))
        app.get("/" + encodeURIComponent("sub_treat_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/treat", "sub_treat_cy"))
        app.get("/" + encodeURIComponent("sub_to be"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/to be", "sub_to be"))
        app.get("/" + encodeURIComponent("sub_to be_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/to be", "sub_to be_cy"))
        app.get("/" + encodeURIComponent("sub_feel"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/feel", "sub_feel"))
        app.get("/" + encodeURIComponent("sub_feel_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/feel", "sub_feel_cy"))
        app.get("/" + encodeURIComponent("sub_know"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/know", "sub_know"))
        app.get("/" + encodeURIComponent("sub_know_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/know", "sub_know_cy"))
        app.get("/" + encodeURIComponent("sub_hate"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/hate", "sub_hate"))
        app.get("/" + encodeURIComponent("sub_hate_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/hate", "sub_hate_cy"))
        app.get("/" + encodeURIComponent("sub_leave"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/leave", "sub_leave"))
        app.get("/" + encodeURIComponent("sub_leave_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/leave", "sub_leave_cy"))
        app.get("/" + encodeURIComponent("sub_a place where livings live"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live", "sub_a place where livings live"))
        app.get("/" + encodeURIComponent("sub_a place where livings live_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live", "sub_a place where livings live_cy"))
        app.get("/" + encodeURIComponent("sub_place"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/place", "sub_place"))
        app.get("/" + encodeURIComponent("sub_place_cy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/place", "sub_place_cy"))
        app.get("/" + encodeURIComponent("sub_zelda-oot"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/6_game/1_zelda-oot", "sub_zelda-oot"))
        app.get("/" + encodeURIComponent("sub_zelda-mm"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/6_game/2_zelda-mm", "sub_zelda-mm"))
        
        // Side
        app.get("/" + encodeURIComponent("side_happy as clams"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/happy/happy as clams", "side_happy as clams"))
        app.get("/" + encodeURIComponent("side_benevolent"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/kind/benevolent", "side_benevolent"))
        app.get("/" + encodeURIComponent("side_poised"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/calm/poised", "side_poised"))
        app.get("/" + encodeURIComponent("side_annoy"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/angry/annoy", "side_annoy"))
        app.get("/" + encodeURIComponent("side_rile"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/angry/rile", "side_rile"))
        app.get("/" + encodeURIComponent("side_trying"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/angry/trying", "side_trying"))
        app.get("/" + encodeURIComponent("side_consolation"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/sorry/consolation", "side_consolation"))
        app.get("/" + encodeURIComponent("side_atone"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap/sorry/atone", "side_atone"))
        app.get("/" + encodeURIComponent("side_enthusiasm"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/interest/enthusiasm", "side_enthusiasm"))
        app.get("/" + encodeURIComponent("side_zeal"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/interest/zeal", "side_zeal"))
        app.get("/" + encodeURIComponent("side_makeover"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/change/makeover", "side_makeover"))
        app.get("/" + encodeURIComponent("side_alter"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/change/alter", "side_alter"))
        app.get("/" + encodeURIComponent("side_alteration"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/change/alteration", "side_alteration"))
        app.get("/" + encodeURIComponent("side_brother"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title/brother", "side_brother"))
        app.get("/" + encodeURIComponent("side_underdog"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title/underdog", "side_underdog"))
        app.get("/" + encodeURIComponent("side_brethren"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title/brethren", "side_brethren"))
        app.get("/" + encodeURIComponent("side_leader"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title/leader", "side_leader"))
        app.get("/" + encodeURIComponent("side_the underdog"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title/the underdog", "side_the underdog"))
        app.get("/" + encodeURIComponent("side_messiah"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/title/messiah", "side_messiah"))
        app.get("/" + encodeURIComponent("side_epidural"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/substance/epidural", "side_epidural"))
        app.get("/" + encodeURIComponent("side_pad"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/substance/pad", "side_pad"))
        app.get("/" + encodeURIComponent("side_anaesthetic"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/substance/anaesthetic", "side_anaesthetic"))
        app.get("/" + encodeURIComponent("side_material"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/substance/material", "side_material"))
        app.get("/" + encodeURIComponent("side_direct"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/straight/direct", "side_direct"))
        app.get("/" + encodeURIComponent("side_indirect"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/straight/indirect", "side_indirect"))
        app.get("/" + encodeURIComponent("side_devious"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/straight/devious", "side_devious"))
        app.get("/" + encodeURIComponent("side_misforgotten"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/misforgotten", "side_misforgotten"))
        app.get("/" + encodeURIComponent("side_prevent"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/prevent", "side_prevent"))
        app.get("/" + encodeURIComponent("side_lest"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/lest", "side_lest"))
        app.get("/" + encodeURIComponent("side_activity"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/activity", "side_activity"))
        app.get("/" + encodeURIComponent("side_plan"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/plan", "side_plan"))
        app.get("/" + encodeURIComponent("side_subjugation"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/subjugation", "side_subjugation"))
        app.get("/" + encodeURIComponent("side_stop"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/stop", "side_stop"))
        app.get("/" + encodeURIComponent("side_subvert"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/subvert", "side_subvert"))
        app.get("/" + encodeURIComponent("side_choice"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/choice", "side_choice"))
        app.get("/" + encodeURIComponent("side_provocation"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/provocation", "side_provocation"))
        app.get("/" + encodeURIComponent("side_action"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/action", "side_action"))
        app.get("/" + encodeURIComponent("side_try"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/try", "side_try"))
        app.get("/" + encodeURIComponent("side_decision"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/decision", "side_decision"))
        app.get("/" + encodeURIComponent("side_active"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/active", "side_active"))
        app.get("/" + encodeURIComponent("side_attempt"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/attempt", "side_attempt"))
        app.get("/" + encodeURIComponent("side_save"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/save", "side_save"))
        app.get("/" + encodeURIComponent("side_feisty"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/feisty", "side_feisty"))
        app.get("/" + encodeURIComponent("side_salvation"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/act/salvation", "side_salvation"))
        app.get("/" + encodeURIComponent("side_cardiac arrest"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/state/cardiac arrest", "side_cardiac arrest"))
        app.get("/" + encodeURIComponent("side_condition"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/state/condition", "side_condition"))
        app.get("/" + encodeURIComponent("side_long-lost"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/time/long-lost", "side_long-lost"))
        app.get("/" + encodeURIComponent("side_chance"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/possibility/chance", "side_chance"))
        app.get("/" + encodeURIComponent("side_bet"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/possibility/bet", "side_bet"))
        app.get("/" + encodeURIComponent("side_double down"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/possibility/double down", "side_double down"))
        app.get("/" + encodeURIComponent("side_risk"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/possibility/risk", "side_risk"))
        app.get("/" + encodeURIComponent("side_bed"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/object/bed", "side_bed"))
        app.get("/" + encodeURIComponent("side_furniture"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/object/furniture", "side_furniture"))
        app.get("/" + encodeURIComponent("side_thing"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/object/thing", "side_thing"))
        app.get("/" + encodeURIComponent("side_crib"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/object/crib", "side_crib"))
        app.get("/" + encodeURIComponent("side_consolation"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/better/consolation", "side_consolation"))
        app.get("/" + encodeURIComponent("side_spruce up"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/better/spruce up", "side_spruce up"))
        app.get("/" + encodeURIComponent("side_improve"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/better/improve", "side_improve"))
        app.get("/" + encodeURIComponent("side_get better"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/better/get better", "side_get better"))
        app.get("/" + encodeURIComponent("side_coherent"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/ability/coherent", "side_coherent"))
        app.get("/" + encodeURIComponent("side_judgement"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/ability/judgement", "side_judgement"))
        app.get("/" + encodeURIComponent("side_reasonable"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/ability/reasonable", "side_reasonable"))
        app.get("/" + encodeURIComponent("side_think"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/think", "side_think"))
        app.get("/" + encodeURIComponent("side_accept"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/accept", "side_accept"))
        app.get("/" + encodeURIComponent("side_all in all"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/all in all", "side_all in all"))
        app.get("/" + encodeURIComponent("side_vulgar"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/vulgar", "side_vulgar"))
        app.get("/" + encodeURIComponent("side_agreement"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/agreement", "side_agreement"))
        app.get("/" + encodeURIComponent("side_consider"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/consider", "side_consider"))
        app.get("/" + encodeURIComponent("side_acceptable"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/acceptable", "side_acceptable"))
        app.get("/" + encodeURIComponent("side_considering"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/considering", "side_considering"))
        app.get("/" + encodeURIComponent("side_have an axe to grind"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/have an axe to grind", "side_have an axe to grind"))
        app.get("/" + encodeURIComponent("side_solidarity"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/solidarity", "side_solidarity"))
        app.get("/" + encodeURIComponent("side_agree"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/agree", "side_agree"))
        app.get("/" + encodeURIComponent("side_opinion"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap/thought/opinon copy", "side_opinion"))
        app.get("/" + encodeURIComponent("side_hide"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/discover/hide", "side_hide"))
        app.get("/" + encodeURIComponent("side_lie low"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/discover/lie low", "side_lie low"))
        app.get("/" + encodeURIComponent("side_find"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/discover/find", "side_find"))
        app.get("/" + encodeURIComponent("side_statement"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/say/statement", "side_statement"))
        app.get("/" + encodeURIComponent("side_break it to sb"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/say/break it to sb", "side_break it to sb"))
        app.get("/" + encodeURIComponent("side_decree"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/say/decree", "side_decree"))
        app.get("/" + encodeURIComponent("side_disavow"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/say/disavow", "side_disavow"))
        app.get("/" + encodeURIComponent("side_tell"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/say/tell", "side_tell"))
        app.get("/" + encodeURIComponent("side_in accordance with"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/follow/in accordance with", "side_in accordance with"))
        app.get("/" + encodeURIComponent("side_fawn"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/show/fawn", "side_fawn"))
        app.get("/" + encodeURIComponent("side_express"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/show/express", "side_express"))
        app.get("/" + encodeURIComponent("side_praise"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/show/praise", "side_praise"))
        app.get("/" + encodeURIComponent("side_respect"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/show/respect", "side_respect"))
        app.get("/" + encodeURIComponent("side_fawn over"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/show/fawn over", "side_fawn over"))
        app.get("/" + encodeURIComponent("side_kowtow"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/show/kowtow", "side_kowtow"))
        app.get("/" + encodeURIComponent("side_trifle with"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/treat/trifle with", "side_trifle with"))
        app.get("/" + encodeURIComponent("side_discrimination"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/treat/discrimination", "side_discrimination"))
        app.get("/" + encodeURIComponent("side_fair"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/treat/fair", "side_fair"))
        app.get("/" + encodeURIComponent("side_indiscriminate"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/treat/indiscriminate", "side_indiscriminate"))
        app.get("/" + encodeURIComponent("side_bode"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/to be/bode", "side_bode"))
        app.get("/" + encodeURIComponent("side_salvation"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/to be/salvation", "side_salvation"))
        app.get("/" + encodeURIComponent("side_vibe"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/feel/vibe", "side_vibe"))
        app.get("/" + encodeURIComponent("side_mood"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/feel/mood", "side_mood"))
        app.get("/" + encodeURIComponent("side_information"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/know/information", "side_information"))
        app.get("/" + encodeURIComponent("side_understand"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/know/understand", "side_understand"))
        app.get("/" + encodeURIComponent("side_fact"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/know/fact", "side_fact"))
        app.get("/" + encodeURIComponent("side_abhor"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/hate/abhor", "side_abhor"))
        app.get("/" + encodeURIComponent("side_go away"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/leave/go away", "side_go away"))
        app.get("/" + encodeURIComponent("side_bugger off"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap/leave/bugger off", "side_bugger off"))
        app.get("/" + encodeURIComponent("side_home"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live/home", "side_home"))
        app.get("/" + encodeURIComponent("side_city"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live/city", "side_city"))
        app.get("/" + encodeURIComponent("side_town"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live/town", "side_town"))
        app.get("/" + encodeURIComponent("side_house"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live/house", "side_house"))
        app.get("/" + encodeURIComponent("side_hovel"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live/hovel", "side_hovel"))
        app.get("/" + encodeURIComponent("side_borough"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live/borough", "side_borough"))
        app.get("/" + encodeURIComponent("side_building"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/a place where livings live/building", "side_building"))
        app.get("/" + encodeURIComponent("side_area"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/place/area", "side_area"))
        app.get("/" + encodeURIComponent("side_point"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/place/point", "side_point"))
        app.get("/" + encodeURIComponent("side_squalor"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/place/squalor", "side_squalor"))
        app.get("/" + encodeURIComponent("side_edge"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/place/edge", "side_edge"))
        app.get("/" + encodeURIComponent("side_bog"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/place/bog", "side_bog"))
        app.get("/" + encodeURIComponent("side_brink"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap/place/brink", "side_brink"))
        
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