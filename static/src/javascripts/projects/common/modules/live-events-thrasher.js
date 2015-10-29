define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/live-events-thrasher.html'
], function (
    bean,
    fastdom,
    $,
    _,
    config,
    template,
    svgs,
    adfreeThrasherTemplate
) {
    var AdfreeThrasher = function (options) {
        var opts = options || {};
        this.$container = opts.$container;

        this.thrasherTmpl = template(adfreeThrasherTemplate,
            {
                surveyHeader: 'Stream all Guardian Live events right from your home',
                marque36icon: svgs('marque36icon'),
                membershipLogo: svgs('membershipLogo'),
                liveStreamingSurvey: config.images.commercial.liveStreamingSurvey,
                surveyNew: svgs('surveyNew')
            });
    };

    AdfreeThrasher.prototype.show = function () {
        fastdom.write(function () {
            this.$container.after(this.thrasherTmpl);

            bean.on(document, 'click', $('.js-thrasher-link'), function (e) {
                e.preventDefault();
                $('.js-survey-overlay').removeClass('u-h');
            });
        }.bind(this));
    };

    return AdfreeThrasher;
});
