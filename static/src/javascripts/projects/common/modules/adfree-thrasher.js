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
                surveyHeader: 'Here\'s new amazing incredible benefit',
                surveyText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse sagittis facilisis libero, ac blandit leo lobortis finibus. Sed vel nunc pulvinar, lobortis neque ut, euismod sapien. Quisque nec euismod tortor, at suscipit orci. Quisque id tincidunt est. Mauris gravida, urna a molestie dictum, magna elit consequat erat, ac ullamcorper nisi nisi nec lorem. Sed imperdiet aliquam urna, in condimentum enim convallis eget. Fusce faucibus dui quis faucibus tristique. Integer id orci elit.',
                surveySubHeader: 'Suspendisse sagittis facilisis libero, ac blandit leo lobortis finibus. Sed vel nunc pulvinar, lobortis neque ut, euismod sapien.',
                linkText: 'Be awesome and take part in our survey',
                surveyLink: 'http://google.com',
                arrowWhiteRight: svgs('arrowWhiteRight'),
                marque54icon: svgs('marque54icon')
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
