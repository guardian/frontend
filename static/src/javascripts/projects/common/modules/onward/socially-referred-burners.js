define([
    'common/modules/ui/images',
    'common/utils/mediator',
    'lodash/objects/assign',
    'common/modules/component'
], function(
    images,
    mediator,
    extend,
    Component
    ){
    function SocialBurners(config) {
        mediator.emit('register:begin','social-content');
        this.config = extend(this.config, config);
        this.endpoint = '/most-referred.json';
    }

    Component.define(SocialBurners);

    SocialBurners.prototype.init = function() {
        this.fetch(document.body, 'html');
    };

    SocialBurners.prototype.ready = function() {
        images.upgrade();
        mediator.emit('register:end','social-content');
    };

    SocialBurners.prototype.error = function() {
        mediator.emit('modules:error', 'Failed to load social burner content on page: ' + this.config.page.pageId + 'common/modules/onwards/related.js');
        mediator.emit('register:error','social-content');
    };


    return SocialBurners;
});
