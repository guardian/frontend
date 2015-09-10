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
                surveyHeader: 'Become a member and experience the Guardian without advertising',
                surveyLink: 'http://google.com',
                marque36icon: svgs('marque36icon'),
                membershipLogo: svgs('membershipLogo')
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
