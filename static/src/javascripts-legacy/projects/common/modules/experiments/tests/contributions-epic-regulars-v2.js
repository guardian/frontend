define([
    'common/modules/commercial/contributions-utilities',
    'lodash/utilities/template',
    'lib/cookies',
    'raw-loader!common/views/contributions-epic-equal-buttons.html',
    'common/modules/tailor/tailor'
], function (
    contributionsUtilities,
    template,
    cookies,
    contributionsEpicEqualButtons,
    tailor
) {
    function controlTemplate(regular) {
        var suffix = regular ? '_regular' : '_non_regular';
        return function(variant) {
            function appendSuffix(code) { return code + suffix; }

            return template(contributionsEpicEqualButtons, {
                linkUrl1: variant.membershipURLBuilder(appendSuffix),
                linkUrl2: variant.contributionsURLBuilder(appendSuffix),
                componentName: variant.componentName,
                title: 'Since you’re here …',
                p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And <span class="contributions__paragraph--highlight">unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can</span>. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                p2: 'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution'
            });
        }
    }

    function fairnessStrongTemplate(regular) {
        var suffix = regular ? '_regular' : '_non_regular';

        return function(variant) {
            function appendSuffix(code) { return code + suffix; }

            return template(contributionsEpicEqualButtons, {
                linkUrl1: variant.membershipURLBuilder(appendSuffix),
                linkUrl2: variant.contributionsURLBuilder(appendSuffix),
                componentName: variant.componentName,
                title: 'Since you’re here …',
                p1: '… we have a small favour to ask. More people than ever are regularly reading the Guardian, but far fewer are paying for it.  Advertising revenues across the media are falling fast. And <span class=\"contributions__paragraph--highlight\"> unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can</span>. So we think it’s fair to ask people who visit us often for their help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                p2: 'If you regularly read and value our reporting, support us now and help make our future much more secure.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution'
            });
        }
    }

    function fairnessStrongAlternateHookTemplate(regular) {
        var suffix = regular ? '_regular' : '_non_regular';
        return function(variant) {
            function appendSuffix(code) { return code + suffix; }

            return template(contributionsEpicEqualButtons, {
                linkUrl1: variant.membershipURLBuilder(appendSuffix),
                linkUrl2: variant.contributionsURLBuilder(appendSuffix),
                componentName: variant.componentName,
                title: 'Hello again …',
                p1: '… today we have a small favour to ask. More people than ever are regularly reading the Guardian, but far fewer are paying for it.  Advertising revenues across the media are falling fast. And <span class="contributions__paragraph--highlight"> unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can</span>. So we think it’s fair to ask people who visit us often for their help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                p2: 'If you regularly read and value our reporting, support us now and help make our future much more secure.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution'
            });
        }
    }

    function renderTemplate(render, template) {
        return tailor.isRegular().then(function (regular) {
            if (regular) {
                render(template(true));
            } else {
                render(controlTemplate(false));
            }
        });
    }

    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicRegularsV2',
        campaignId: 'kr1_epic_regulars_v2',

        start: '2017-03-07',
        expiry: '2017-05-01',

        author: 'Jonathan Rankin',
        description: 'Test messages aimed at our regular readers',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Establish which variant has the highest conversion rate',

        audienceCriteria: 'All',
        audience: 0.5,
        audienceOffset: 0,


        variants: [
            {
                id: 'control',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViewws: 0
                },
                test: function(render) {
                    renderTemplate(render, controlTemplate);
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            },
            {
                id: 'fairness_strong',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                test: function(render) {
                    renderTemplate(render, fairnessStrongTemplate);
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            },
            {
                id: 'fairness_strong_alternate_hook',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                test: function(render) {
                    renderTemplate(render, fairnessStrongAlternateHookTemplate);
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            }
        ]
    });
});
