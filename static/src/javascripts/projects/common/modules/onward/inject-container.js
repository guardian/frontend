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
    mediator) {
    var containerUrlTemplate = '/container/use-layout/{containerId}.json';

    function injectContainer(containerId) {
        return ajax({
            url: containerUrlTemplate.replace('{containerId}', containerId),
            crossOrigin: true
        }).then(function (resp) {
            if (resp.html) {
                fastdom.write(function () {
                    var $related = $('.js-related');
                    $related.before(resp.html);
                    $related.css({
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
