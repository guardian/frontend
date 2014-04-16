/*
    Module: live-filter.js
    Description: Filter displayed events depending on their type
*/
define([
    'common/$',
    'common/modules/component',
    'lodash/collections/toArray'
], function (
    $,
    component,
    toArray
) {
    'use strict';

    function Filter(context) {
        this.context = context || document;
        this.componentClass = 'live-filter';
        this.useBem = true;
    }

    component.define(Filter);

    Filter.prototype.template = '<div class="live-toggler-wrapper" data-component="live-toggle">' +
        '   <span class="live-toggler__label">Order by:</span>' +
        '  <button class="u-button-reset live-toggler live-toggler--latest js-live-toggler" title="Sort by latest first">' +
        '    <span class="live-toggler__value">Latest</span>' +
        '    <i class="i i-arrow-grey-down"></i>' +
        '  </button>' +
        '  <button class="u-button-reset live-toggler live-toggler--oldest js-live-toggler" title="Sort by oldest first">' +
        '    <span class="live-toggler__value">Oldest</span>' +
        '    <i class="i i-arrow-grey-down"></i>' +
        '  </button>' +
        '</div>';

    Filter.prototype.ready = function() {
        this.on('click', '.js-live-toggler', this.toggle);
    };

    Filter.prototype.toggle = function() {
        var blocks = toArray($('.block', this.context).detach());
        blocks.reverse();

        this.toggleState('order-by-oldest');
        $(this.context).append(blocks);
    };

    return Filter;
});
