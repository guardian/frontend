define([
    "common",
    "modules/autoupdate",
    "modules/matchnav",
    "modules/analytics/reading",
    "modules/discussion/discussion",
    "modules/cricket",
    "modules/inline-link-card"
], function (
    common,
    AutoUpdate,
    MatchNav,
    Reading,
    Discussion,
    Cricket,
    InlineLinkCard
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
                        path: function() {
                            var id = context.querySelector('.article-body .block').id,
                                path = window.location.pathname;
                           return path + '.json' + '?lastUpdate=' + id;
                        },
                        delay: 60000,
                        attachTo: context.querySelector(".article-body"),
                        switches: config.switches,
                        manipulationType: 'prepend'
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

        logReading: function() {
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

        initCricket: function() {
            common.mediator.on('page:article:ready', function(config, context) {

                var cricketMatchRefs = config.referencesOfType('esaCricketMatch');

                if(cricketMatchRefs[0]) {
                    var options = { url: cricketMatchRefs[0],
                                loadSummary: true,
                                loadScorecard: true,
                                summaryElement: '.article-headline',
                                scorecardElement: '.article-headline',
                                summaryManipulation: 'after',
                                scorecardManipulation: 'after' };
                    Cricket.cricketArticle(config, context, options);
                }
            });
        },
        initInlineLinkCard: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                var linksToCardify = context.querySelectorAll('.article-body > p a[href^="/"]');

                function cardifyRelatedInBodyLink(link) {
                    new InlineLinkCard(link, link.parentNode, 'Related').init();
                }
                function isArticle(url) {
                    return /[0-9]{4}\/[a-z]{3}\/[0-9]{2}/g.test(url);
                }

                if (linksToCardify.length > 0) {

                    if (linksToCardify.length === 1) {
                        // There's only one link
                        cardifyRelatedInBodyLink(linksToCardify[0]);
                    } else {
                        // There are multiple links
                        var articleParagraphs = context.querySelectorAll('.article-body > p'),
                            numberOfArticleParagraphs = articleParagraphs.length,
                            insertCardEveryNParagraphs = 4,
                            lastParagraphsToNotCardify = 3, // Always allow enough space to display a card
                            linksInParagraph,
                            numberOfLinksInParagraph,
                            i = 0,
                            j,
                            linkWasCardified;

                        // Looking for links every insertCardEveryNParagraphs paragraphs
                        while (i < (numberOfArticleParagraphs - lastParagraphsToNotCardify)) {
                            linksInParagraph = articleParagraphs[i].querySelectorAll('a[href^="/"]');
                            numberOfLinksInParagraph = linksInParagraph.length;
                            j = 0;
                            linkWasCardified = false;

                            if (numberOfLinksInParagraph > 0) {
                                while (j < numberOfLinksInParagraph) {
                                    if (isArticle(linksInParagraph[j].href)) {
                                        cardifyRelatedInBodyLink(linksInParagraph[j]);
                                        linkWasCardified = true;

                                        break;
                                    }
                                    j++;
                                }
                            }
                            if (linkWasCardified) {
                                i = i + insertCardEveryNParagraphs;
                            } else {
                                i++;
                            }
                        }
                    }
                }
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.matchNav();
            modules.initLiveBlogging();
            modules.logReading();
            modules.initDiscussion();
            modules.initCricket();
            modules.initInlineLinkCard();
        }
        common.mediator.emit("page:article:ready", config, context);
    };

    return {
        init: ready
    };

});
