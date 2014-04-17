define([
    'common/component',
    'lodash/objects/assign'
], function(component, extend){

    var NotificationBar = function(config) {
        this.config = extend(config, this.config);
    };

    component.define(NotificationBar);

    NotificationBar.prototype.template = '<div class="block block--notification js-block-notification"><div class="block-elements">' +
        'Show <span class="count js-count"></span></div> new posts</div>';

    NotificationBar.prototype.setState = function() {

    };

});