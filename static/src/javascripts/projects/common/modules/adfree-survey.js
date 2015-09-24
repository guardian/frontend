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
    adfreeSurveyTemplate
) {
    var AdfreeSurvey = function () {
        this.bannerTmpl = template(adfreeSurveyTemplate,
            {
                surveyHeader: 'Advert free experience on the Guardian site and apps',
                surveyText: 'From <em>£5 a month</em> join exclusive Guardian events, get a quality ad free experience of our site and apps plus support our journalism.',
                linkText: 'Explore Guardian Members',
                alreadyMember: 'Already a member?',
                alreadyMemberLink: '/commercial/ad-free-survey',
                surveyLink: '/commercial/ad-free-survey',
                arrowWhiteRight: svgs('arrowWhiteRight'),
                marque36icon: svgs('marque36icon'),
                crossIcon: svgs('crossIcon'),
                surveyOverlay: svgs('surveyOverlay'),
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

