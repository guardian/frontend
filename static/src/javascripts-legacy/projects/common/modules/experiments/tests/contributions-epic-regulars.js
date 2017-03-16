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



    var bwidCookie = cookies.get('bwid') || '';

    function controlTemplate(regular) {
        var suffix = regular ? '_regular' : '_non_regular';
        return function(variant) {
            function appendSuffix(code) { return code + suffix; }

            return template(contributionsEpicEqualButtons, {
                linkUrl1: variant.membershipURLBuilder(appendSuffix),
                linkUrl2: variant.contributionsURLBuilder(appendSuffix),
                title: 'Since you’re here …',
                p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And unlike many news organisations we haven’t put up a paywall – we want to keep our journalism as open as we can. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                p2: 'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution'
            });
        }
    }

    function fairnessMildTemplate(regular) {
        var suffix = regular ? '_regular' : '_non_regular';
        return function(variant) {
            function appendSuffix(code) { return code + suffix; }

            return template(contributionsEpicEqualButtons, {
                linkUrl1: variant.membershipURLBuilder(appendSuffix),
                linkUrl2: variant.contributionsURLBuilder(appendSuffix),
                title: 'Since you’re here …',
                p1: '… we have a small favour to ask. More people than ever are regularly reading the Guardian, but far fewer are paying for it.  Advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                p2: 'If you regularly read and value our reporting, support us now and help make our future much more secure.',
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
                title: 'Since you’re here …',
                p1: '… we have a small favour to ask. More people than ever are regularly reading the Guardian, but far fewer are paying for it.  Advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can. So we think it’s fair to ask people who visit us often for their help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
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
                title: 'Hello again …',
                p1: '… today we have a small favour to ask. More people than ever are regularly reading the Guardian, but far fewer are paying for it.  Advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can. So we think it’s fair to ask people who visit us often for their help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                p2: 'If you regularly read and value our reporting, support us now and help make our future much more secure.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution'
            });
        }
    }

    function relianceTemplate(regular) {
        var suffix = regular ? '_regular' : '_non_regular';
        return function(variant) {
            function appendSuffix(code) { return code + suffix; }

            return template(contributionsEpicEqualButtons, {
                linkUrl1: variant.membershipURLBuilder(appendSuffix),
                linkUrl2: variant.contributionsURLBuilder(appendSuffix),
                title: 'Since you’re here …',
                p1: '… we have a small favour to ask. More people than ever rely on the Guardian to keep them up-to-date, but far fewer are paying for our journalism. Advertising revenues across the media are falling fast. And unlike many news organisations, we haven’t put up a paywall – we want to keep our journalism as open as we can. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                p2: 'If you depend on our reporting to stay informed, support us now and help make our future much more secure.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution'
            });
        }
    }

    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicRegulars',
        campaignId: 'kr1_epic_regulars',

        start: '2017-03-07',
        expiry: '2017-03-21',

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
                    minDaysBetweenViews: 0
                },
                test: function(render) {
                    if (bwidCookie) {
                        tailor.getRegularStatus(bwidCookie).then(function (regular) {
                            render(controlTemplate(regular));
                        });
                    } else {
                        render(controlTemplate(false));
                    }
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            },
            {
                id: 'fairness_mild',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                test: function(render) {
                    if (bwidCookie) {
                        tailor.getRegularStatus(bwidCookie).then(function (regular) {
                            render(fairnessMildTemplate(regular));
                        });
                    } else {
                        render(fairnessMildTemplate(false));
                    }
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
                    if (bwidCookie) {
                        tailor.getRegularStatus(bwidCookie).then(function (regular) {
                            render(fairnessStrongTemplate(regular));
                        });
                    } else {
                        render(fairnessStrongTemplate(false));
                    }
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
                    if (bwidCookie) {
                        tailor.getRegularStatus(bwidCookie).then(function (regular) {
                            render(fairnessStrongAlternateHookTemplate(regular));
                        });
                    } else {
                        render(fairnessStrongAlternateHookTemplate(false));
                    }
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            },
            {
                id: 'reliance',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                test: function(render) {
                    if (bwidCookie) {
                        tailor.getRegularStatus(bwidCookie).then(function (regular) {
                            render(relianceTemplate(regular));
                        });
                    } else {
                        render(relianceTemplate(false));
                    }
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            }
        ]
    });
});
