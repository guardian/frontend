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
                surveyHeader: 'Personalise your Guardian',
                surveyText: 'To remove all messages from this particular Guardian service simply sign up to the Guardian. To choose exactly which other commercial messages you\'d like to see from the Guardian, or not, become a Member from £5 a month.',
                signupText: 'Sign-up now',
                membershipText: 'Become a Member',
                signupLink: '/commercial/survey-simple-sign-up',
                membershipLink: '/commercial/survey-simple-membership',
                signupDataLink: 'signup',
                membershipDataLink: 'membership',
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
