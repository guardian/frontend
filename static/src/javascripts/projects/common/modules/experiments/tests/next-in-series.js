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
            pageId: 'lifeandstyle/2016/mar/11/i-fought-off-mountain-lion-experience',
            title: '‘I lost three limbs to meningitis aged 54’',
            trail: '‘When I looked down after the first operation, I thought that I looked like a drawing of a body with the feet and half the calves rubbed out...’'
        },
        {
            id: 'blind-date',
            pageId: 'lifeandstyle/2016/mar/12/ross-hoping-for-vin-diesel-meets-charles-blind-date',
            title: 'Will Zak and Mimi hit it off?',
            trail: '‘I used the wrong fork for the starter and dropped my knife’'
        },
        {
            id: 'alanis',
            pageId: 'lifeandstyle/2016/mar/11/ask-alanis-best-friends-secrets',
            title: '‘Dear Alanis, my accidental email has created a family rift’',
            trail: '‘Although I sent a grovelling apology I’m wondering if she’ll speak to me again. What can I do?’'
        },
        {
            id: 'what-im-really-thinking',
            pageId: 'lifeandstyle/2016/mar/12/mother-of-baby-with-disabilities-what-im-really-thinking',
            title: 'What I’m Really Thinking: the independent cafe barista',
            trail: '‘I wonder if they realise the cost of their coffee is half what I get paid per hour...’'
        },
        {
            id: 'yotam',
            pageId: 'lifeandstyle/2016/mar/12/merguez-recipes-kebab-potato-bake-scotch-egg-yotam-ottolenghi',
            title: 'Yotam Ottolenghi’s chorizo recipes',
            trail: 'Salty, spicy, smoky and fatty: chorizo adds oomph to any dish'
        }
    ];

    var pageId = window.guardian.config.page.pageId;
    var series = find(allSeries, function (series) {
        return series.pageId === pageId;
    });

    return function () {
        this.id = 'NextInSeries';
        this.start = '2016-03-07';
        this.expiry = '2016-03-23';
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
