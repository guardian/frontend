define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax',
    'common/modules/ui/images',
    'common/utils/mediator'
], function (
    fastdom,
    $,
    _,
    ajax,
    images,
    mediator
) {

    function injectContainer(containerUrl) {
        return ajax({
            url: containerUrl,
            crossOrigin: true
        }).then(function (resp) {
            if (resp.html) {
                fastdom.write(function () {
                    var $pop= $('.js-most-popular-footer');
                    $pop.before(resp.html);
                    $pop.css({
                        display: 'none'
                    });
                    images.upgradePictures();
                    mediator.emit('ab-briefing-loaded');
                });
            }
        });
    }

    return {
        injectContainer: injectContainer
    };
});
