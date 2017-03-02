define([
    'bean',
    'common/modules/commercial/contributions-utilities',
    'common/utils/template',
    'common/utils/config',
    'common/utils/$',
    'text!common/views/epic-supporter-cta.html',
    'text!common/views/acquisitions-visual.html'
], function (
    bean,
    contributionsUtilities,
    template,
    config,
    $,
    epicSupporterCta,
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
        id: 'AcquisitionsLoveBoatV2',
        campaignId: 'kr2_visual_v2',

        start: '2017-03-02',
        expiry: '2017-04-20',

        author: 'Dominic Kendrick',
        description: 'Evaluate a couple of new asks against the original Epic',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Acquires many Supporters',

        audienceCriteria: 'Everyone except AU',
        audience: 0.32,
        audienceOffset: 0.68,
        locationCheck: function (geo) {
            return geo !== 'AU';
        },

        variants: [
            {
                id: 'control',
                maxViews: maxViews,
                template: function epic(membershipUrl) {
                    return template(epicSupporterCta, {
                        linkUrl1: membershipUrl,
                        title: 'Since you’re here …',
                        p1: '… we’ve got a small favour to ask. More people are reading the Guardian than ever, but far fewer are paying for it. Advertising revenues across the media are falling fast. And unlike some other news organisations, we haven’t put up a paywall – we want to keep our journalism open to all. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                        p2: 'If everyone who reads our reporting, who likes it, helps to support it, our future would be much more secure.',
                        p3: '',
                        cta1: 'Become a Supporter'
                    });
                },
                successOnView: true
            },
            {
                id: 'love',
                maxViews: maxViews,
                template: function love(supportUrl) {
                    return template(visualTemplate, {
                        id: 'love',
                        supportUrl: supportUrl,
                        data: {
                            title: 'Lots of people love reading us …',
                            subtitle: '… but love alone doesn’t keep the lights on',
                            image: png('laptop-hearts'),
                            imageAlt: 'A laptop showing the guardian website surrounded by love hearts',
                            body: 'The love and support of our readers is vital to securing our future. Our fearless, independent journalism takes a lot of time, hard work and money to produce. And it is increasingly funded by our readers. That’s why we need you to help.',
                        },

                        supportText: '<span class="brand">Guardian Supporters</span> help to secure our future. If you love the work we do, support us now and show how much you care.',
                        link: supportUrl
                    });
                },

                onInsert: handleClick,
                successOnView: true
            },
            {
                id: 'boat',
                maxViews: maxViews,
                template: function boat(supportUrl) {
                    return template(visualTemplate, {
                        id: 'boat',
                        supportUrl: supportUrl,
                        data: {
                            title: 'We don’t have a billionaire owner … ',
                            subtitle: '… we have only one shareholder, The Scott Trust',
                            image: png('boat'),
                            imageAlt: 'A boat moves off the edge of the image',
                            body: '<p>This keeps our independent, investigative, public-interest journalism free from commercial or political pressures.</p><p>Our reporting seeks truth, not approval. It takes a lot of time, hard work and money to produce, and is increasingly funded by our readers.</p>',
                        },

                        supportText: '<span class="brand">Guardian Supporters</span> help to secure our future. Please support our journalism and together we can hold the powerful to account.',
                        link: supportUrl
                    });
                },

                onInsert: handleClick,
                successOnView: true
            }
        ]
    });
});
