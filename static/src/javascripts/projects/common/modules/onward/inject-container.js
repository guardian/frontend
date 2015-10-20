/*
 Module: history-containers.js
 Description: Inject personalised containers based on reading history
 */
define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax',
    'common/modules/ui/images'
], function (
    fastdom,
    $,
    _,
    ajax,
    images
) {
    var containerUrlTemplate = '/container/use-layout/{containerId}.json';

    function injectContainer(containerId) {
        return ajax({
            url: containerUrlTemplate.replace('{containerId}', containerId),
            crossOrigin: true
        }).then(function (resp) {
            if (resp.html) {
                fastdom.write(function() {
                    var $related = $('.js-related');
                    $related.before(resp.html);
                    $related.css({
                        display: 'none'
                    });
                    images.upgradePictures();
                });
            }
        });
    }

    return {
        injectContainer: injectContainer
    };
});
