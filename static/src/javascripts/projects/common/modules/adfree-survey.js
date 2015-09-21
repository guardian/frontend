define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/adfree-survey.html'
], function (
    bean,
    fastdom,
    $,
    _,
    template,
    svgs,
    adfreeSurvey
) {

    /**
     * Message which is shown as an overlay to all users who want to remove ads.
     *
     * @constructor
     * @param {Object=} options
     */
    var AdfreeSurvey = function () {
    };

    AdfreeSurvey.prototype.attach = function () {
        var bannerTmpl = template(adfreeSurvey,
            {
                surveyHeader: 'Advert free experience on the Guardian site and apps',
                surveyText: 'From £5 a month join exclusive Guardian events, get a quality ad free experience of our site and apps plus support our journalism.',
                linkText: 'Explore Guardian Members',
                alreadyMember: 'Already a member?',
                alreadyMemberLink: '/adfreesurvey-page',
                surveyLink: 'http://google.com',
                arrowWhiteRight: svgs('arrowWhiteRight'),
                marque36icon: svgs('marque36icon'),
                crossIcon: svgs('crossIcon'),
                surveyOverlay: svgs('surveyOverlay'),
                surveyNew: svgs('surveyNew'),
                membershipLogo: svgs('membershipLogo')
            });

        fastdom.write(function () {
            $(document.body).append(bannerTmpl);

            bean.on(document, 'click', $('.js-survey-close'), function () {
                $('.js-survey-overlay').addClass('u-h');
            });
        });
    };

    return AdfreeSurvey;
});

