define([
    'bean',
    'common/modules/commercial/contributions-utilities',
    'common/utils/template',
    'common/utils/config',
    'common/utils/$',
    'common/views/svgs',
    'text!common/views/contributions-epic-equal-buttons.html',
    'text!common/views/acquisitions-visual.html'
], function (
    bean,
    contributionsUtilities,
    template,
    config,
    $,
    svgs,
    epicEqualButtons,
    visualTemplate
) {
    var maxViews = {
        days: 30,
        count: 4,
        minDaysBetweenViews: 0
    };

    function png(name) {
        try {
            return config.images.acquisitions[name];
        }

        catch (e) {
            return '';
        }
    }

    function handleClick(container) {
        var button = $('.contributions__option-button--visual', container);

        if (button && button[0]) {
            bean.on(button[0], 'click', function () {
                container.attr('data-step', 2);
            });
        }
    }

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsLoveBoat',
        campaignId: 'kr2_visual',

        start: '2017-02-16',
        expiry: '2017-05-01',

        author: 'Sam Desborough',
        description: 'Evaluate a couple of new asks against the original Epic',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Acquires many Supporters',

        audienceCriteria: 'Everyone except AU',
        audience: 0.15,
        audienceOffset: 0.52,

        locationCheck: function (geo) {
            return geo !== 'AU';
        },

        variants: [
            {
                id: 'control',
                maxViews: maxViews,
                template: function epic(contributionUrl, membershipUrl) {
                    return template(epicEqualButtons, {
                        linkUrl1: membershipUrl,
                        linkUrl2: contributionUrl,
                        title: 'Since you’re here …',
                        p1: '… we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                        p2: 'If everyone who reads our reporting, who likes it, helps to pay for it, our future would be much more secure.',
                        p3: '',
                        cta1: 'Become a Supporter',
                        cta2: 'Make a contribution'
                    });
                },
                successOnView: true
            },
            {
                id: 'love',
                maxViews: maxViews,
                template: function love(_, supportUrl) {
                    return template(visualTemplate, {
                        id: 'love',
                        supportUrl: supportUrl,

                        step1: {
                            title: 'Like reading the Guardian?',
                            image: png('newspaper'),
                            cta: '<span class="heart">&hearts;</span> Show us your love'
                        },

                        step2: {
                            // there is an emoji here...
                            title: 'Thanks! <span class="emoji">&#x1F60D;</span>',
                            subtitle: '… but love alone doesn’t keep the lights on',
                            image: png('newspaper-hearts'),
                            body: 'The love and support of our readers is vital to securing our future. Our fearless, independent journalism takes a lot of time, hard work and money to produce. And it is increasingly funded by our readers. That’s why we need you to help.',
                        },

                        supportText: '<span class="brand">Guardian Supporters</span> help to secure our future. If you love the work we do, support us now and show how much you care.',
                        buttonIcon: svgs('arrowRight'),
                        link: supportUrl
                    });
                },

                onInsert: handleClick,
                successOnView: true
            },
            {
                id: 'boat',
                maxViews: maxViews,
                template: function boat(_, supportUrl) {
                    return template(visualTemplate, {
                        id: 'boat',
                        supportUrl: supportUrl,
                        step1: {
                            title: 'Like reading the Guardian?',
                            image: '',
                            button: '&hearts; Show us your love'
                        }
                    });
                },
                successOnView: true
            }
        ]
    });
});
