define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/adfree-thrasher.html'
], function (
    bean,
    fastdom,
    $,
    _,
    template,
    svgs,
    adfreeThrasherTemplate
) {
    var AdfreeThrasher = function (options) {
        var opts = options || {};
        this.$container = opts.$container;

        this.thrasherTmpl = template(adfreeThrasherTemplate,
            {
                surveyHeader: 'Become a member and experience the Guardian without advertising',
                marque36icon: svgs('marque36icon'),
                membershipLogo: svgs('membershipLogo'),
                thrasherBenefit: svgs('thrasherBenefit'),
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
