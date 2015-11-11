define([
    'fastdom',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/modules/ui/images',
    'common/utils/mediator'
], function (
    fastdom,
    $,
    ajax,
    config,
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
                    $el.after(resp.html);
                    if (!(config.page && config.page.hasStoryPackage)) {
                        $el.css({
                            display: 'none'
                        });
                    }
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
