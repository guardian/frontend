define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/survey/survey-simple.html'
], function (
    bean,
    fastdom,
    $,
    template,
    svgs,
    surveySimpleTemplate
) {
    var surveySimple = function () {
        this.bannerTmpl = template(surveySimpleTemplate,
            {
                surveyHeader: 'Take control of commercial messages',
                surveyText: "For <em>£5 a month</em>  you can curate which Guardian products and services we show you on the Guardian site. So if you don't want to see Soulmates or Jobs again, you don't have to, you can just support our journalism.",
                linkText: 'Sign-up now',
                surveyLink: '/commercial/survey-simple',
                arrowWhiteRight: svgs('arrowWhiteRight'),
                marque36icon: svgs('marque36icon'),
                crossIcon: svgs('crossIcon'),
                surveyOverlaySimple: svgs('surveyOverlaySimple')
            });
    };

    surveySimple.prototype.attach = function () {
        fastdom.write(function () {
            $(document.body).append(this.bannerTmpl);

            bean.on(document, 'click', $('.js-survey-close'), function () {
                $('.js-survey-overlay').addClass('u-h');
            });
        }.bind(this));
    };

    return surveySimple;
});
