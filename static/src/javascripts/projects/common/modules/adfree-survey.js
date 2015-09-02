define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/adfree-survey.html'
], function (
    fastdom,
    $,
    _,
    template,
    svgs,
    adfreeSurvey
) {

    /**
     * Message which is shown as an overlay to all users who want to remove ads.
     *
     * @constructor
     * @param {Object=} options
     */
    var AdfreeSurvey = function () {
    };

    AdfreeSurvey.prototype.show = function () {
        var bannerTmpl = template(adfreeSurvey,
            {
                surveyHeader: 'Here\'s new amazing incredible benefit',
                surveyText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse sagittis facilisis libero, ac blandit leo lobortis finibus. Sed vel nunc pulvinar, lobortis neque ut, euismod sapien. Quisque nec euismod tortor, at suscipit orci. Quisque id tincidunt est. Mauris gravida, urna a molestie dictum, magna elit consequat erat, ac ullamcorper nisi nisi nec lorem. Sed imperdiet aliquam urna, in condimentum enim convallis eget. Fusce faucibus dui quis faucibus tristique. Integer id orci elit.',
                surveySubHeader: 'Suspendisse sagittis facilisis libero, ac blandit leo lobortis finibus. Sed vel nunc pulvinar, lobortis neque ut, euismod sapien.',
                linkText: 'Be awesome and take part in our survey',
                surveyLink: 'http://google.com',
                cursor: svgs('cursor'),
                marque54icon: svgs('marque54icon')
            });

        fastdom.write(function () {
            $(document.body).append(bannerTmpl);
        });
    };

    return AdfreeSurvey;
});

