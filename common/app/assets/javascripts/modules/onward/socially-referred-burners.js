define([
    'common/common',
    'common/modules/ui/images',
    'common/utils/mediator',
    'lodash/objects/assign',
    'common/modules/component'
], function(
    common,
    images,
    mediator,
    extend,
    Component
    ){
    function SocialBurners(config, context) {
        mediator.emit('register:begin','social-content');
        this.config = extend(this.config, config);
        this.context = context;
        this.endpoint = '/most-referred.json';

        this.fetch(this.context, 'html');
    }

    Component.define(SocialBurners);

    SocialBurners.prototype.ready = function() {
        images.upgrade(this.context);
        mediator.emit('register:end','social-content');
    };

    SocialBurners.prototype.error = function() {
        common.mediator.emit('modules:error', 'Failed to load social burner content on page: ' + this.config.page.pageId + 'common/modules/onwards/related.js');
        mediator.emit('register:error','social-content');
    };


    return SocialBurners;
});