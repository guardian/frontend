define([
    'bonzo',
    'bean',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/component',
    'common/modules/sport/score-board'
], function (
    bonzo,
    bean,
    $,
    ajax,
    config,
    detect,
    Component,
    ScoreBoard
) {
    function cricket() {
        var cricketScore, parentEl,
            matchIdentifier = config.page.cricketMatch;

        if (matchIdentifier) {
            cricketScore = new Component();
            parentEl = $('.js-cricket-score')[0];

            cricketScore.endpoint = '/sport/cricket/match/' + matchIdentifier + '.json';
            cricketScore.fetch(parentEl, 'summary');
        }
    }

    function rugby() {

        var pageType = '';

        if (config.page.isLiveBlog) {
            pageType = 'minbymin';
        } else if (config.hasTone('Match reports')) {
            pageType = 'report';
        }

        if (config.page.rugbyMatch && pageType) {

            var $h = $('.js-score');

            var scoreBoard = new ScoreBoard({
                pageType: pageType,
                parent: $h,
                autoupdated: false,
                responseDataKey: 'matchSummary',
                endpoint: config.page.rugbyMatch + '.json?page=' + encodeURIComponent(config.page.pageId)});

            // Rugby score returns the match nav too, to optimise calls.
            scoreBoard.fetched = function (resp) {
                $.create(resp.nav).first().each(function (nav) {
                    // There ought to be exactly two tabs; match report and min-by-min
                    if ($('.tabs__tab', nav).length === 2) {
                        $('.js-football-tabs').append(nav);
                    }
                });

                var content = $.create(resp.scoreEvents);
                var dropdownTemplate = detect.isBreakpoint({ max: 'mobile' }) && resp.dropdown;
                var name = 'Score breakdown';
                var button;

                if (detect.isBreakpoint({ max: 'mobile' })) {
                    $('.js-after-article').append(
                        $.create(dropdownTemplate).each(function (dropdown) {
                            var $dropdown = $(dropdown).addClass('dropdown--key-events');
                            if (config.page.isLiveBlog) { $dropdown.addClass('dropdown--key-events'); }
                            $dropdown.addClass('dropdown--active');
                            $('.dropdown__label', dropdown).append(name);
                            $('.dropdown__content', dropdown).append(content);
                            button = $('.dropdown__button', dropdown);
                            button
                                .attr('data-link-name', 'Show dropdown: ' + name);
                        })
                    );
                } else {
                    var placeholder = $.create('<div class="hide-on-mobile"></div>');
                    $('.score-container').after(placeholder);
                    placeholder.append(content);
                }

            };

            scoreBoard.load();
        }
    }

    function init()  {
        cricket();
    }

    return {
        init: init,
        rugby: rugby
    };
});
