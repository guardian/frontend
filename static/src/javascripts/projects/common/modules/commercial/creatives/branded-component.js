define([
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'text!common/views/commercial/creatives/branded-component.html'
], function (
    qwery,
    $,
    config,
    template,
    brandedComponentTpl
) {

    return {

        run: function () {
            $.create(template(brandedComponentTpl, { imgUrl: config.images.commercial.brandedComponentJobs }))
                .appendTo(qwery('.content__secondary-column')[0]);

            $('#dfp-ad--merchandising-high').css('display', 'none');
        }

    };

});
