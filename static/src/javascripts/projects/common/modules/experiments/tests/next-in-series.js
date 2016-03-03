define([
    'common/utils/$',
    'lodash/collections/find'
], function (
    $,
    find
) {
    var render = function (state) {
        return '<div class="next-in-series-test">' +
            '<h3>Coming up next week</h3>' +
            '<h4>' + state.title + '</h4>' +
            '<p class="next-in-series-test__teaser">' + state.trail + '</p>' +
            '<a href="' + state.link + '"' +
                ' data-link-name="next in series | remind me"' +
                ' class="button button--large next-in-series-test__remind-me-link">Remind me</a>' +
        '</div>';
    };

    var $articleBody = $('.content__article-body');

    var allSeries = [
        {
            name: 'Experience',
            pageId: 'lifeandstyle/2016/mar/04/experience-my-head-was-crushed-by-a-rock-thrown-at-my-car',
            title: 'I fought off a mountain lion',
            trail: 'Its ears were slanted in attack position, its teeth yellow splinters buried in black gums',
            link: 'https://www.surveymonkey.co.uk/r/guardian-experience-remindme'
        },
        {
            name: 'Blind Date',
            pageId: 'lifeandstyle/2016/mar/05/blind-date-valerio-matt',
            title: 'Will Charles and Ross hit it off?',
            trail: 'What was I hoping for? Vin Diesel',
            link: 'https://www.surveymonkey.co.uk/r/guardian-blinddate-remindme'
        },
        {
            name: 'Alanis',
            pageId: 'lifeandstyle/2016/mar/04/ask-alanis-morissette-husband-or-son',
            title: 'Dear Alanis, My friends share my secrets with their partners. What do I do?',
            trail: 'Suddenly my secrets are not so safe, and it leaves me feeling vulnerable',
            link: 'https://www.surveymonkey.co.uk/r/guardian-alanis-remindme'
        },
        {
            name: 'What I’m Really Thinking',
            pageId: 'lifeandstyle/2016/mar/05/what-really-thinking-theme-park-costume-character',
            title: 'What I’m Really Thinking: the mother of a disabled baby',
            trail: 'Normal now means a routine of tube feeding, tracheostomy care, physiotherapy, overnight shifts and endless logistics',
            link: 'https://www.surveymonkey.co.uk/r/guardian-whatimreallythinking-remindme'
        }
    ];

    var pageId = window.guardian.config.page.pageId;
    var series = find(allSeries, function (series) {
        return series.pageId === pageId;
    });

    return function () {
        this.id = 'NextInSeries';
        this.start = '2016-03-07';
        this.expiry = '2016-03-30';
        this.author = 'Oliver Ash';
        this.description = 'Show next in series';
        this.audience = 0;
        this.audienceOffset = 0.3;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {

                }
            },
            {
                id: 'variant',
                test: function () {
                    if (series) {
                        var el = $.create(render(series));
                        el.insertAfter($articleBody);
                    }
                }
            }
        ];
    };
});
