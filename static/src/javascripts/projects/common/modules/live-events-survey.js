define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/views/svgs',
    'ldsh!common/views/commercial/live-events-survey'
], function (
    bean,
    fastdom,
    $,
    config,
    svgs,
    adfreeSurveyTemplate) {
    var AdfreeSurvey = function () {
        this.bannerTmpl = adfreeSurveyTemplate(
            {
                surveyHeader: 'Live stream all the Guardian Live events',
                surveyText: 'From <em>£5 a month</em> join exclusive Guardian events, watch the debates that shape our stories and support our journalism.',
                linkText: 'Join Guardian Members',
                alreadyMember: 'Already a member?',
                alreadyMemberLink: '/commercial/ad-free-survey',
                surveyLink: '/commercial/ad-free-survey',
                arrowWhiteRight: svgs('arrowWhiteRight'),
                marque36icon: svgs('marque36icon'),
                crossIcon: svgs('crossIcon'),
                overlayEvent1: config.images.commercial.overlayEvent1,
                overlayEvent2: config.images.commercial.overlayEvent2,
                overlayEvent3: config.images.commercial.overlayEvent3,
                surveyNew: svgs('surveyNew'),
                membershipLogo: svgs('membershipLogo')
            });
    };

    AdfreeSurvey.prototype.attach = function () {
        fastdom.write(function () {
            $(document.body).append(this.bannerTmpl);

            bean.on(document, 'click', $('.js-survey-close'), function () {
                $('.js-survey-overlay').addClass('u-h');
            });
        }.bind(this));
    };

    return AdfreeSurvey;
});
