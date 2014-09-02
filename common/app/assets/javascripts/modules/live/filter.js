/*
    Module: live-filter.js
    Description: Filter displayed events depending on their type
*/
define([
    'bonzo',
    'common/utils/$',
    'common/modules/component',
    'common/utils/mediator',
    'lodash/collections/toArray'
], function (
    bonzo,
    $,
    component,
    mediator,
    toArray
) {
    'use strict';

    function Filter() {
        this.componentClass = 'live-filter';
        this.useBem = true;
    }

    component.define(Filter);

    Filter.prototype.template = '<div><span class="live-toggler__label">Order by:</span>' +
        '  <button class="u-button-reset live-toggler live-toggler--latest js-live-toggler" title="Sort by oldest first">' +
        '    <span class="live-toggler__value">Latest</span>' +
        '    <i class="i i-arrow-grey-down"></i>' +
        '  </button>' +
        '  <button class="u-button-reset live-toggler live-toggler--oldest js-live-toggler" title="Sort by latest first">' +
        '    <span class="live-toggler__value">Oldest</span>' +
        '    <i class="i i-arrow-grey-down"></i>' +
        '  </button></div>';

    Filter.prototype.ready = function() {
        this.on('click', '.js-live-toggler', this.toggle);
    };

    Filter.prototype.toggle = function() {
        var blocks = toArray($('.block').detach());
        blocks.reverse();

        this.toggleState('order-by-oldest');
        bonzo(document.body).prepend(blocks);

        mediator.emit('module:filter:toggle', this.hasState('order-by-oldest'));
    };

    return Filter;
});
