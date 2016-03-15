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
    var surveySimple = function (config) {
        this.config = config || {};
        this.bannerTmpl = template(surveySimpleTemplate,
            {
                surveyHeader: this.config.surveyHeader,
                surveyText: this.config.surveyText,
                signupText: this.config.signupText,
                membershipText: this.config.membershipText,
                signupLink: this.config.signupLink,
                membershipLink: this.config.membershipLink,
                signupDataLink: this.config.signupDataLink,
                membershipDataLink: this.config.membershipDataLink,
                showCloseBtn: this.config.showCloseBtn,
                arrowWhiteRight: svgs('arrowWhiteRight'),
                marque36icon: svgs('marque36icon'),
                crossIcon: svgs('crossIcon'),
                surveyOverlaySimple: svgs('surveyOverlaySimple')
            });
    };

    surveySimple.prototype.attach = function () {
        fastdom.write(function () {
            $(document.body).append(this.bannerTmpl);

            if (this.config.showCloseBtn) {
                bean.on(document, 'click', $('.js-survey-close'), function () {
                    $('.js-survey-overlay').addClass('u-h');
                });
            }
        }.bind(this));
    };

    surveySimple.prototype.show = function () {
        fastdom.write(function () {
            $('.js-survey-overlay').removeClass('u-h');
        });
    };

    return surveySimple;
});
