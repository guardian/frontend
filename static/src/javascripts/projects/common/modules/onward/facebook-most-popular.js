define([
    'common/modules/component',
    'common/utils/mediator'
], function (
    Component,
    mediator
) {
    function FacebookMostPopular(context) {
        this.context = context;
        this.endpoint = '/most-read-facebook.json';
        this.fetch(this.context, 'html');
    }

    FacebookMostPopular.prototype.ready = function () {
        mediator.emit('page:new-content', this.elem);
    };

    Component.define(FacebookMostPopular);

    return FacebookMostPopular;
});