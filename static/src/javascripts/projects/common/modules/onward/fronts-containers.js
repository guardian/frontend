define([
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/ajax',
    'common/modules/analytics/register'
], function (
    fastdom,
    $,
    config,
    mediator,
    ajax,
    register) {


    function FrontsContainers() {
        register.begin('fronts-containers');
        this.endpoint = '/uk/some-containers/3/0/original.json';

        return ajax({
            url: this.endpoint,
            crossOrigin: true
        }).then(function (resp) {
            if (resp.html) {
                fastdom.write(function () {
                    var $el = $('.js-onward');
                    $el.html(resp.html);

                    register.end('fronts-containers');
                    mediator.emit('modules:frontsContainers:loaded');
                    mediator.emit('page:new-content');
                    mediator.emit('ui:images:upgradePictures');
                });
            }
        });
    }

    return FrontsContainers;

});
