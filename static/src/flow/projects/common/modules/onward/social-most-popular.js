define([
    'common/modules/component',
    'common/utils/mediator'
], function (
    Component,
    mediator
) {
    function SocialMostPopular(context, socialContext) {
        this.context = context;
        this.endpoint = '/most-read-' + socialContext + '.json';
        this.fetch(this.context, 'html');
    }

    Component.define(SocialMostPopular);

    SocialMostPopular.prototype.ready = function (elem) {
        mediator.emit('page:new-content', elem);
    };

    return SocialMostPopular;
});
