define([
    'common/modules/component'
], function (
    Component
) {
    function FacebookMostPopular(context) {
        this.context = context;
        this.endpoint = '/most-read-facebook.json';
        this.fetch(this.context, 'html');
    }

    Component.define(FacebookMostPopular);

    return FacebookMostPopular;
});