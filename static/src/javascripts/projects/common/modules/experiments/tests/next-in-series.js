define([
    'common/utils/$',
    'lodash/collections/find'
], function (
    $,
    find
) {
    var path = '/surveys/404-test/next-in-series/';
    var render = function (state) {
        return '<div class="next-in-series-test">' +
            '<h3>Coming up next week</h3>' +
            '<h4>' + state.title + '</h4>' +
            '<p class="next-in-series-test__teaser">' + state.trail + '</p>' +
            '<a href="' + path + state.id + '"' +
                ' data-link-name="next in series | remind me"' +
                ' class="button button--large next-in-series-test__remind-me-link">Remind me</a>' +
        '</div>';
    };

    var $articleBody = $('.content__article-body');

    var allSeries = [
        {
            id: 'experience',
            pageId: 'lifeandstyle/2016/apr/15/experience-i-watched-my-dad-die-then-come-back-to-life',
            title: 'I watched my dad die - then come back to life',
            trail: '‘I ran to him and held his hand; it was tense but there was no pulse’'
        },
        {
            id: 'alanis',
            pageId: 'society/2016/apr/15/ask-alanis-morissette-how-can-stop-drinking-so-much',
            title: 'Dear Alanis, how can I stop drinking so much?',
            trail: '‘I started drinking at university, and 25 years later, I still drink daily and often too much…’'
        },
        {
            id: 'oliver-burkeman',
            pageId: 'lifeandstyle/2016/apr/16/how-to-deal-with-email-overload',
            title: 'How to deal with email overload',
            trail: 'Trying to stay on top of email is a losing battle'
        }
    ];

    var pageId = window.guardian.config.page.pageId;
    var series = find(allSeries, function (series) {
        return series.pageId === pageId;
    });

    return function () {
        this.id = 'NextInSeries';
        this.start = '2016-03-24';
        this.expiry = '2016-04-12';
        this.author = 'Oliver Ash';
        this.description = 'Show next in series';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'We will track clicks on the button and email the next article to people who complete the survey in order to track the return journey. We will measure these to see what the interest is like.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'next in series | remind me';
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
