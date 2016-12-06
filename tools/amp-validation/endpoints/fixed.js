/*
    NB: these may be duplicated elsewhere in scala tests
    that extend AmpValidityTest - consider adding any new
    URLs there as well.  Not centralising as running full
    suite in scala tests may be overkill as we add more tests
*/
module.exports = (() => {
    return [

        /*
            Tones
         */
        '/commentisfree/2016/aug/09/jeremy-corbyn-supporters-voters-labour-leader-politics', // Comment tone
        '/politics/2016/aug/09/tom-watson-interview-jeremy-corbyn-labour-rifts-hug-shout', // Feature tone
        '/travel/2016/aug/09/diggerland-kent-family-day-trips-in-uk', // Review tone
        '/global/2016/aug/09/guardian-weekly-letters-media-statues-predators', // Letters tone
        '/commentisfree/2016/aug/08/the-guardian-view-on-the-southern-train-strike-keep-the-doors-open-for-talks', // Editorials tone
        '/lifeandstyle/shortcuts/2016/aug/09/why-truck-drivers-are-sick-of-chips-with-everything', // Features tone
        '/business/2016/aug/09/china-uk-investment-key-questions-following-hinkley-point-c-delay', // Analysis tone

        /*
            Embeds
         */
        // TODO: enable the commented out endpoints once issues with each one have been fixed
        '/world/2016/aug/25/spain-mariano-rajoy-third-general-election-christmas-day', // Guardian Video + Interactive
        '/us-news/live/2016/aug/25/donald-trump-news-hillary-clinton-campaign-live-coverage', // Image
        '/sport/2016/aug/25/katie-ledecky-first-pitch-washington-nationals-bryce-harper', // Instagram + Twitter
        '/sport/live/2016/aug/25/county-cricket-surrey-lancashire-live-blog', // Twitter
        //'/sport/blog/2016/aug/25/baseball-olympic-games-2020-tokyo-mlb-team-selection', // Vine
        '/stage/2016/aug/24/they-drink-it-in-the-congo-review-adam-brace', // Vimeo
        '/commentisfree/2016/aug/25/burkini-french-muslim-isis', // Videop
        //'/music/musicblog/2010/sep/02/wiley-ustream', // uStream
        //'/world/2015/mar/16/london-teenagers-stopped-syria-parents-islamic-state', // audioboom
        '/sport/2014/jul/03/tour-de-france-2014-yellow-jersey-contenders-chris-froome-stats-history', // infrostrada
        //'/education/live/2016/aug/25/gcse-results-day-2016-uk-students-get-their-grades-live',  // guardian witness
        '/lifeandstyle/2016/jun/04/dont-talk-politics-sex-ex-10-ways-ruin-a-date',  // gif
        '/football/2016/jun/20/ngolo-kante-france-euro-2016-caen-jose-saez', // guardian audio
        '/science/2016/may/25/neanderthals-built-mysterious-cave-structures-175000-years-ago', // dailymotion
        '/sustainable-business/live/2016/sep/16/coffee-climate-change-smallholders-central-america-ethiopia-technology-funding', // commercial badge with dimensions
        '/somerset-county-council-partner-zone/2016/sep/21/somerset-offers-opportunities-develop-social-work-career', // page with GLabs badge
        '/world/2016/sep/19/democratic-republic-congo-demonstrations-banned-police-killed-joseph-kabila-etienne-tshisekedi', // google maps
        '/news/2016/may/09/how-mossack-fonseca-missed-warning-signs-of-70-million-boiler-room-scam-panama-papers', // scribd
        '/sport/2015/nov/18/jonah-lomu-interview-2015-world-cup-audio', // soundcloud
        '/music/musicblog/2016/jul/21/yello-swiss-pop-pioneers-return-with-new-video-limbo', // vevo
        //'/tv-and-radio/2014/nov/07/shelter-refuses-to-take-donations-from-itv-star-dapper-laughs', // vine #2
        '/politics/2016/aug/25/how-has-the-brexit-vote-affected-your-life-share-your-experiences', // formstack

        /*
            Other
         */
        '/books/2011/aug/24/jorge-luis-borges-google-doodle', // More on this story
        '/uk-news/2016/aug/09/southern-rail-strike-war-of-words-heats-up-on-second-day', // Story package / tone news
        '/football/2016/jul/10/france-portugal-euro-2016-match-report', // Match summary

        /*
            Live blogs
         */
        '/us-news/live/2016/aug/12/donald-trump-republicans-hillary-clinton-us-election-live', // Live blog
        '/sport/live/2016/aug/20/rio-2016-olympics-day-15-mo-farah-relays-tom-daley-nicola-adams-football-live', // Sport live blog

        /*
            Paid for by pages
         */
        '/somerset-county-council-partner-zone/2016/sep/21/somerset-offers-opportunities-develop-social-work-career',

        /*
            Hosted pages
         */
        '/advertiser-content/audi-history-of-audi/audi-and-innovation', //hosted article page
        '/advertiser-content/chester-zoo-act-for-wildlife/ensuring-a-future-for-south-asian-wildlife', //hosted article page with video
        '/advertiser-content/chester-zoo-act-for-wildlife/what-we-fight-for', //hosted gallery page
        '/advertiser-content/chester-zoo-act-for-wildlife/making-wildlife-friendly-habitats', //hosted video non-youtube page
        '/advertiser-content/explore-canada-food-busker-in-canada/duelling-bagels' //hosted video youtube page
    ];
})();
