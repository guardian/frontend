define([
    'common/utils/mediator',
    'common/modules/component',
    'lodash/objects/assign'
], function(mediator, component, extend){

    function NotificationBar(config) {
        this.config = extend(config, this.config);
        this.attachTo = this.config.attachTo;
        this.mediator = mediator;
    }

    component.define(NotificationBar);

    NotificationBar.prototype.componentClass = 'notify';
    NotificationBar.prototype.manipulationType = 'prepend';
    NotificationBar.prototype.classes = {
        'count' : 'js-notify-count',
        'button' : 'js-notify-btn',
        'count-plural' : 'js-notify-count__plural'
    };

    NotificationBar.prototype.template = '<div class="block block--notification js-block-notification notify">' +
        '<div class="block-elements"><button class="notify__btn u-button-reset js-notify-btn"> ' +
        'Show <span class="notify__count js-notify-count"></span> new post<span class="js-notify-count__plural">s</button></div></div>';

    NotificationBar.prototype.ready = function() {
        this.on('click', this.getClass('button'), function() {
            this.setState('hidden');
            this.mediator.emit('modules:notificationbar:show', true);
        });
    };

    NotificationBar.prototype.notify = function(count) {
        if(!this.rendered) { this.render(this.attachTo); }
        this.removeState('hidden');
        this.setCount(count);
    };

    NotificationBar.prototype.setCount = function(count) {
        this.getElem('count').innerHTML = count;
        this.getElem('count-plural').style.display = (count === 1) ? 'none' : 'inline';
    };

    return NotificationBar;
});
