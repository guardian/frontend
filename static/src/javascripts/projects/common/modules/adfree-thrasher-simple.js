define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/adfree-thrasher-simple.html'
], function (
    bean,
    fastdom,
    $,
    _,
    template,
    svgs,
    adfreeThrasher
) {

    /**
     * Message which is shown as an trash component to encourage people in joining membership.
     *
     * @constructor
     * @param {Object=} options
     */
    var AdfreeThrasher = function (options) {
        var opts = options || {};
        this.$container = opts.$container || '';
    };

    AdfreeThrasher.prototype.show = function () {
        var thrasherTmpl = template(adfreeThrasher,
            {
                surveyHeader: 'Experience the Guardian <span>without advertising</span>',
                surveyLink: 'http://google.com',
                marque36icon: svgs('marque36icon'),
                thrasherBenefitSimple: svgs('thrasherBenefitSimple')
            });

        fastdom.write(function () {
            this.$container.after(thrasherTmpl);

            bean.on(document, 'click', $('.js-thrasher-link'), function (e) {
                e.preventDefault();
                $('.js-survey-overlay').removeClass('u-h');
            });
        }.bind(this));
    };

    return AdfreeThrasher;
});
