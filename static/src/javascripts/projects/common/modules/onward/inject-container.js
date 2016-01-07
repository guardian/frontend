define([
    'fastdom',
    'common/utils/$',
    'common/utils/ajax-promise',
    'common/utils/config',
    'common/modules/ui/images',
    'common/utils/mediator',
    'common/modules/analytics/register'
], function (
    fastdom,
    $,
    ajax,
    config,
    images,
    mediator,
    register
) {

    function injectContainer(containerUrl, $container, containerName, callback) {
        register.begin(containerName);

        return ajax({
            url: containerUrl,
            type: 'json',
            method: 'get',
            crossOrigin: true
        }).then(function (resp) {
            if (resp.html) {
                fastdom.write(function () {
                    $container.html(resp.html);

                    register.end(containerName);
                    mediator.emit('modules:' + containerName + ':loaded');
                    mediator.emit('page:new-content');
                    mediator.emit('ui:images:upgradePictures');
                });
            }

            callback(resp.html === '');
        });
    }

    return {
        injectContainer: injectContainer
    };
});
