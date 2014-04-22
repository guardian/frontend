define([
    'common/modules/component',
    'lodash/objects/assign'
], function(component, extend){

    function NotificationBar(config) {
        this.config = extend(config, this.config);
        this.attachTo = this.config.attachTo;
    }

    component.define(NotificationBar);

    NotificationBar.prototype.template = '<div class="block block--notification js-block-notification">' +
        '<div class="block-elements">Show <span class="count js-count"></span></div> new posts</div>';

    NotificationBar.prototype.notify = function(count) {
        if(!this.rendered) { this.render(this.attachTo); }
        this.setState(count);
    };

    NotificationBar.prototype.notify = function(count) {
        this.getElem('count').innerHTML = count;
    };

    return NotificationBar;
});