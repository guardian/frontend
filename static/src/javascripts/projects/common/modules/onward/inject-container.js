define([
    'fastdom',
    'common/utils/$',
    'common/utils/ajax',
    'common/modules/ui/images',
    'common/utils/mediator'
], function (
    fastdom,
    $,
    ajax,
    images,
    mediator
) {

    function injectContainer(containerUrl, containerSelector, containerName) {
        return ajax({
            url: containerUrl,
            crossOrigin: true
        }).then(function (resp) {
            if (resp.html) {
                fastdom.write(function () {
                    var $el = $(containerSelector);
                    $el.before(resp.html);
                    $el.css({
                        display: 'none'
                    });
                    images.upgradePictures();
                    mediator.emit(containerName);
                });
            }
        });
    }

    return {
        injectContainer: injectContainer
    };
});
