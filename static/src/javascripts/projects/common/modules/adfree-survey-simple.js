define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/adfree-survey-simple.html'
], function (
    bean,
    fastdom,
    $,
    _,
    template,
    svgs,
    adfreeSurveySimple
) {

    /**
     * Message which is shown as an overlay to all users who want to remove ads.
     *
     * @constructor
     * @param {Object=} options
     */
    var AdfreeSurveySimple = function () {
    };

    AdfreeSurveySimple.prototype.attach = function () {
        var bannerTmpl = template(adfreeSurveySimple,
            {
                surveyHeader: 'Advert free experience on the Guardian site and apps',
                surveyText: 'From £5 a month get a quality advert free experience of the Guardian and support our journalism.',
                linkText: 'Get advert free experience',
                surveyLink: '/adfreesurvey-page',
                arrowWhiteRight: svgs('arrowWhiteRight'),
                marque36icon: svgs('marque36icon'),
                crossIcon: svgs('crossIcon'),
                surveyOverlaySimple: svgs('surveyOverlaySimple')
            });

        fastdom.write(function () {
            $(document.body).append(bannerTmpl);

            bean.on(document, 'click', $('.js-survey-close'), function () {
                $('.js-survey-overlay').addClass('u-h');
            });
        });
    };

    return AdfreeSurveySimple;
});

