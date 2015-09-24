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
    adfreeSurveySimpleTemplate
) {
    var AdfreeSurveySimple = function () {
        this.bannerTmpl = template(adfreeSurveySimpleTemplate,
            {
                surveyHeader: 'Advert free experience on the Guardian site and apps',
                surveyText: 'From <em>£5 a month</em> get a quality advert free experience of the Guardian and support our journalism.',
                linkText: 'Get advert free experience',
                surveyLink: '/commercial/ad-free-survey-simple',
                arrowWhiteRight: svgs('arrowWhiteRight'),
                marque36icon: svgs('marque36icon'),
                crossIcon: svgs('crossIcon'),
                surveyOverlaySimple: svgs('surveyOverlaySimple')
            });
    };

    AdfreeSurveySimple.prototype.attach = function () {
        fastdom.write(function () {
            $(document.body).append(this.bannerTmpl);

            bean.on(document, 'click', $('.js-survey-close'), function () {
                $('.js-survey-overlay').addClass('u-h');
            });
        }.bind(this));
    };

    return AdfreeSurveySimple;
});

