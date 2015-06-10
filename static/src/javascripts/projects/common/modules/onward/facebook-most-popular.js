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

    Component.define(FacebookMostPopular);

    FacebookMostPopular.prototype.ready = function (elem) {
        mediator.emit('page:new-content', elem);
    };

    return FacebookMostPopular;
});
