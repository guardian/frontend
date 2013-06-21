define([
    "common",

    "modules/autoupdate",
    "modules/matchnav",
    "modules/analytics/reading",
    "modules/discussion/discussion",
    "modules/storage"
], function (
    common,
    AutoUpdate,
    MatchNav,
    Reading,
    Discussion,
    storage
) {

    var modules = {

        matchNav: function(){
            var matchNav = new MatchNav();
            common.mediator.on('page:article:ready', function(config, context) {
                if(config.page.section === "football") {
                    var teamIds = config.referencesOfType('paFootballTeam');
                    var isRightTypeOfContent = config.hasTone("Match reports") || config.hasTone("Minute by minutes");

                    if(teamIds.length === 2 && isRightTypeOfContent){
                        var url = "/football/api/match-nav/";
                            url += config.webPublicationDateAsUrlPart() + "/";
                            url += teamIds[0] + "/" + teamIds[1];
                            url += "?currentPage=" + encodeURIComponent(config.page.pageId);

                        matchNav.load(url, context);
                    }
                }
            });
        },

        initLiveBlogging: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.page.isLive) {
                    var a = new AutoUpdate({
                        path: window.location.pathname,
                        delay: 60000,
                        attachTo: context.querySelector(".article-body"),
                        switches: config.switches,
                        responseSelector: '.article-body .block'
                    }).init();
                }
            });
        },

        initDiscussion: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.page.commentable) {
                    var discussionArticle = new Discussion({
                        id: config.page.shortUrl,
                        context: context,
                        config: config
                    }).init();
                }
            });
        },

        logReading: function(context) {
            common.mediator.on('page:article:ready', function(config, context) {
                var wordCount = config.page.wordCount;
                if(wordCount !== "") {

                    var reader = new Reading({
                        id: config.page.pageId,
                        wordCount: parseInt(config.page.wordCount, 10),
                        el: context.querySelector('.article-body'),
                        ophanUrl: config.page.ophanUrl
                    });

                    reader.init();
                }
            });
        },

        paragraphSpacing: function(config) {
            // NOTE: force user's to view particular paragraph spacing - can be deleted
            // TODO: ability to force user in particular ab test
            var hash = window.location.hash,
                storageKey = 'gu.test.paragraph-spacing',
                test = (hash.indexOf('#paragraph-spacing=') === 0) ? hash.split('=')[1] : storage.get(storageKey);
            if (test) {
                ['control', 'no-spacing-indents', 'more-spacing'].some(function(validTest) {
                    if (test === validTest) {
                        if (config.page.contentType === 'Article') {
                            // remove any existing 'test-paragraph-spacing--' classes (added by the ab test)
                            document.body.className = document.body.className.replace(/(\s|^)test-paragraph-spacing--[^\s]*/g, '')
                                + ' test-paragraph-spacing--' + test;
                            // force ab test off, in case it runs later
                            config.switches.abParagraphSpacing = false;
                        }
                        storage.set(storageKey, test);
                        return true;
                    }
                });
            }
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.paragraphSpacing(config);
            modules.matchNav();
            modules.initLiveBlogging();
            modules.logReading(context);

            modules.initDiscussion();
        }
        common.mediator.emit("page:article:ready", config, context);
    };

    return {
        init: ready
    };

});
