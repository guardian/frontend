define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/views/svgs',
    'tpl!common/views/commercial/live-events-thrasher.html'
], function (
    bean,
    fastdom,
    $,
    config,
    svgs,
    adfreeThrasherTemplate) {
    var AdfreeThrasher = function (options) {
        var opts = options || {};
        this.$container = opts.$container;

        this.thrasherTmpl = adfreeThrasherTemplate(
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
