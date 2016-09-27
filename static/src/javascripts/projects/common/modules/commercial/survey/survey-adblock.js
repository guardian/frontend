define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/modules/user-prefs',
    'common/views/svgs',
    'text!common/views/commercial/survey/survey-adblock.html',
    'lodash/arrays/uniq',
    'common/utils/countdown',
    'common/utils/cookies'
], function (
    bean,
    fastdom,
    $,
    template,
    userprefs,
    svgs,
    surveyAdBlockTemplate,
    uniq,
    countdown,
    cookies
) {
    var surveyAdBlock = function (config) {
        this.config = config || {};
        this.bannerTmpl = template(surveyAdBlockTemplate,
            {
                surveyHeader: this.config.surveyHeader,
                surveyText: this.config.surveyText,
                surveyTextSecond: this.config.surveyTextSecond,
                surveyTextThird: this.config.surveyTextThird,
                surveyTextMembership: this.config.surveyTextMembership,
                surveyTextSubscriber: this.config.surveyTextSubscriber,
                surveyTextUserHelp: this.config.surveyTextUserHelp,
                signupText: this.config.signupText,
                membershipText: this.config.membershipText,
                signupLink: this.config.signupLink,
                membershipLink: this.config.membershipLink,
                signupDataLink: this.config.signupDataLink,
                membershipDataLink: this.config.membershipDataLink,
                subscriberLink: this.config.subscriberLink,
                subscriberText: this.config.subscriberText,
                subscriberDataLink: this.config.subscriberDataLink,
                contributorLink: this.config.contributorLink,
                contributorText: this.config.contributorText,
                contributorDataLink: this.config.contributorDataLink,
                showCloseBtn: this.config.showCloseBtn,
                arrowWhiteRight: svgs('arrowWhiteRight'),
                marque36icon: svgs('marque36icon'),
                crossIcon: svgs('crossIcon'),
                surveyOverlaySimple: svgs('surveyOverlaySimple')
            });
    };

    surveyAdBlock.prototype.attach = function () {
        fastdom.write(function () {
            $(document.body).append(this.bannerTmpl);
            if (this.config.showCloseBtn) {
                bean.on(document, 'click', $('.js-survey-adblock__close-btn'), function () {
                    $('.survey-adblock').addClass('is-hidden');
                    var cookieName = 'gu_abm_x',
                        cookieLifetimeMinutes = 30,
                        cookieCount = cookies.get(cookieName) ? parseInt(cookies.get(cookieName)) : 0;
                    cookies.addForMinutes(cookieName, cookieCount + 1, cookieLifetimeMinutes);
                });
            }
        }.bind(this));
    };

    surveyAdBlock.prototype.show = function () {
        fastdom.write(function () {
            $('.js-survey-adblock').removeClass('is-hidden');
        });
        if (this.config.showCloseBtn) {
            if (this.config.showCloseBtn === 'delayed') {
                countdown.startTimer(5, function(seconds) {
                    if (seconds < 1) {
                        fastdom.write(function () {
                            $('.js-survey-adblock__close-btn').removeClass('is-hidden');
                        });
                    }
                });
            } else {
                fastdom.write(function () {
                    $('.js-survey-adblock__close-btn').removeClass('is-hidden');
                });
            }
        }
    };

    return surveyAdBlock;
});
