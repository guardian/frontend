define([
    'lib/config',
    'lib/mediator',
    'common/modules/component',
    'common/modules/ui/images'
], function (
    config,
    mediator,
    Component,
    images
) {
    function SocialBurners() {
        mediator.emit('register:begin', 'social-content');
        this.endpoint = '/most-referred.json';
    }

    Component.define(SocialBurners);

    SocialBurners.prototype.init = function () {
        this.fetch(document.body, 'html');
    };

    SocialBurners.prototype.ready = function () {
        images.upgradePictures();
        mediator.emit('register:end', 'social-content');
    };

    SocialBurners.prototype.error = function () {
        mediator.emit('modules:error', 'Failed to load social burner content on page: ' + config.page.pageId + 'common/modules/onwards/related.js');
        mediator.emit('register:error', 'social-content');
    };

    return SocialBurners;
});
