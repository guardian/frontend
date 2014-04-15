/*
    Module: live-filter.js
    Description: Filter displayed events depending on their type
*/
define([
    '$',
    'common/component'
], function (
    $,
    component
) {
    'use strict';

    function Filter(context) {
        this.context = context || document;
    }

    Filter.prototype.template = '<div class="live-toggler-wrapper" data-component="live-toggle">' +
        '   <span class="live-toggle__label">Sort by:</span>' +
        '  <button class="u-button-reset live-toggler live-toggler--latest js-live-toggler" title="Sort by latest first">' +
        '    <span class="live-toggler__value">Latest</span>' +
        '    <i class="i i-arrow-grey-down"></i>' +
        '  </button>' +
        '  <button class="u-button-reset live-toggler live-toggler--oldest js-live-toggler" title="Sort by oldest first">' +
        '    <span class="live-toggler__value">Oldest</span>' +
        '    <i class="i i-arrow-grey-down"></i>' +
        '  </button>' +
        '</div>';

    component.define(Filter);

    Filter.prototype.ready = function() {
        this,on('click', '.js-live-toggler', this.toggle);
    };

    Filter.prototype.toggle = function() {
        $('.blocks', this,context).detach();
    };

    Filter.prototype.init = function() {
        var self = this;
        bonzo(this.context.getElementsByClassName('js-live-filter')[0]).replaceWith(this.template);

        this.findKeyEvents();

        common.mediator.on('modules:autoupdate:loaded', function() {
            self.findKeyEvents.call(self);
        });

        bean.on(this.context, 'click', '.js-live-toggler', function(e) {
            e.preventDefault();
            self.showKeyEvents.call(self);
        });
    };

    return Filter;
});
