define([
    // Common libraries
    'common/$',
    'common/utils/mediator',
    'bonzo',
    'qwery',
    // Modules
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/to-array',
    'common/modules/facia/collection-show-more',
    'common/modules/facia/container-toggle',
    'common/modules/sport/football/fixtures',
    'common/modules/sport/cricket',
    'common/modules/ui/message',
    'common/modules/analytics/mvt-cookie'
], function (
    $,
    mediator,
    bonzo,
    qwery,
    detect,
    storage,
    toArray,
    CollectionShowMore,
    ContainerToggle,
    FootballFixtures,
    cricket,
    Message,
    mvtCookie
    ) {

    var modules = {

        showCollectionShowMore: function () {
            mediator.on('page:front:ready', function(config, context) {
                $('.container', context).each(function(container) {
                    $('.js-collection--show-more', container).each(function(collection) {
                        new CollectionShowMore(collection).addShowMore();
                    });
                });
            });
        },

        showContainerToggle: function () {
            mediator.on('page:front:ready', function(config, context) {
                $('.js-container--toggle', context).each(function(container) {
                    new ContainerToggle(container).addToggle();
                });
            });
        },

        showFootballFixtures: function(path) {
            mediator.on('page:front:ready', function(config, context) {
                if (config.page.edition === 'UK' && (config.page.pageId === "" || config.page.pageId === "sport")) {
                    // wrap the return sports stats component in an 'item'
                    var prependTo = bonzo(bonzo.create('<li class="item item--sport-stats item--sport-stats-tall"></li>'));
                    mediator.on('modules:footballfixtures:render', function() {
                        var $container = $('.container--sport', context).first();
                        if ($container[0]) {
                            var $collection = $('.collection', $container[0]);
                            $('.item:first-child', $collection[0])
                                // add empty item
                                .after(prependTo);
                            $collection.removeClass('collection--without-sport-stats')
                                .addClass('collection--with-sport-stats');
                        }
                    });
                    new FootballFixtures({
                        prependTo: prependTo,
                        attachMethod: 'append',
                        competitions: ['500', '510', '100', '400'],
                        contextual: false,
                        expandable: true,
                        numVisible: config.page.pageId === "" ? 3 : 5
                    }).init();
                }
            });
        },

        showCricket: function(){
            mediator.on('page:front:ready', function(config, context) {
                cricket.cricketTrail(config, context);
            });
        },

        displayAlphaMessage: function(config) {
            if (config.page.contentType === 'Network Front') {
                var page = window.location.pathname.replace('-alpha', ''),
                    preferenceUrl = '/preference' + page + 'alpha/[OPT]?page=' + page + '%3Ftime=' + (new Date().getTime()),
                    msg,
                    messageId = 'facia-alpha';
                if (config.page.pageId === "") {
                    // only run on 5% of (mobile) users
                    var isAChosenOne = parseInt(mvtCookie.getMvtValue(), 10) < (mvtCookie.MAX_INT * 0.05) && detect.getMobileOS(),
                        alphaSwitch = {
                            '/uk': 'networkFrontUkAlpha',
                            '/us': 'networkFrontUsAlpha',
                            '/au': 'networkFrontAuAlpha'
                        }[page];
                    if ((isAChosenOne && config.switches[alphaSwitch] === true) || window.location.hash === '#show-alpha-opt-in') {
                        msg =
                            '<p class="site-message__message">' +
                                'We’re trying out some new things on our website and would love your feedback. <a href="' +
                                    preferenceUrl.replace('[OPT]', 'optin') + '">Click here</a> to explore a test version of the site.' +
                            '</p>';
                        new Message(messageId).show(msg);
                    }
                } else {
                    var userZoomSurvey = {
                        '/us': 'MSBDMTBTMTE1',
                        '/au': 'MSBDMTBTMTE2'
                    }[page];
                    msg =
                        '<p class="site-message__message">' +
                            'You’re viewing a test version of the Guardian website.' +
                        '</p>' +
                        '<ul class="site-message__actions unstyled">' +
                            (
                                (userZoomSurvey) ?
                                    '<li class="site-message__actions__item">' +
                                        '<i class="i i-comment-grey"></i>' +
                                        '<a href="https://s.userzoom.com/m/' + userZoomSurvey + '" data-link-name="feedback" target="_blank">We’d love to hear your feedback</a>' +
                                    '</li>' : ''
                            ) +
                            '<li class="site-message__actions__item">' +
                                '<i class="i i-back"></i>' +
                                '<a class="js-main-site-link" rel="nofollow" href="' + preferenceUrl.replace('[OPT]', 'optout') + '"' +
                                    'data-link-name="opt-out">Opt-out and return to the standard site</a>' +
                            '</li>' +
                        '</ul>';
                    var opts = {
                        permanent: true
                    };
                    new Message(messageId, opts).show(msg);
                }
            }
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showCollectionShowMore();
            modules.showContainerToggle();
            modules.showFootballFixtures();
            modules.displayAlphaMessage(config);
        }
        mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
