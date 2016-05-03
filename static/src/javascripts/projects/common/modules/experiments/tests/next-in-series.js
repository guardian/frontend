define([
    'common/utils/$',
    'lodash/collections/find',
    'lodash/collections/pluck',
    'lodash/collections/some'
], function (
    $,
    find,
    pluck,
    some
) {
    var surveyPath = '/surveys/404-test/next-in-series/';
    var render = function (state) {
        return '<div class="next-in-series-test">' +
            '<h3>Coming up next week</h3>' +
            '<h4>' + state.title + '</h4>' +
            '<p class="next-in-series-test__teaser">' + state.trail + '</p>' +
            '<a href="' + surveyPath + state.id + '"' +
                ' data-link-name="next in series | remind me"' +
                ' class="button button--large next-in-series-test__remind-me-link">Remind me</a>' +
        '</div>';
    };

    var $articleBody = $('.content__article-body');

    var allSeries = [
        {
            id: 'experience',
            pageId: 'lifeandstyle/2016/mar/25/i-paid-to-have-my-daughter-kidnapped-experience',
            title: 'I was attacked by a seal',
            trail: '‘It rolled on top of me, pushing me under water. I was trapped under a mountain of blubber and muscle…’'
        }
    ];

    var pageId = window.guardian.config.page.pageId;
    var series = find(allSeries, function (series) {
        return series.pageId === pageId;
    });

    return function () {
        this.id = 'NextInSeries';
        this.start = '2016-03-24';
        this.expiry = '2016-05-03';
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
                },

                success: function(complete) {
                    var onSurvey = new RegExp(surveyPath.replace(/\/$/, '')).test(window.location.href);

                    var referredFromSeries = some(pluck(allSeries, 'pageId'), function (id) {
                        return new RegExp(id).test(window.document.referrer);
                    });

                    if (onSurvey && referredFromSeries) {
                        complete();
                    }
                }
            }
        ];
    };
});
