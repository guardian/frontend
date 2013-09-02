/*
    Module: live-blog-filter.js
    Description: Filter displayed events depending on their type
*/
define([
    'common',
    'bonzo',
    'bean'
], function (
    common,
    bonzo,
    bean
) {
    'use strict';

    function Filter(context) {
        this.context = context || document;
        this.articleContainer = this.context.getElementsByClassName('js-article__container')[0];
        this.template =
            '<div class="live-blog-toggler-wrapper">' +
            '    <button class="live-blog-toggler live-blog-toggler--all u-button-reset js-live-blog-toggler" data-link-name="filter display key-events">' +
            '        <span class="let__label">View</span>' +
            '        <span class="h">Key events instead of</span>' +
            '        <span class="let__value">All posts</span>' +
            '    </button>' +
            '    <button class="live-blog-toggler live-blog-toggler--key-events u-button-reset js-live-blog-toggler" data-link-name="filter display all posts">' +
            '        <span class="let__label">View</span>' +
            '        <span class="h">All posts instead of</span>' +
            '        <span class="let__value">Key events</span>' +
            '    </button>' +
            '</div>';
    }

    Filter.prototype.init = function() {
        var self = this;
        this.context.getElementsByClassName('js-live-blog-filter')[0].innerHTML = this.template;

        bean.on(this.context, 'click', '.js-live-blog-toggler', function(e) {
            e.preventDefault();
            self.showKeyEvents.call(self);
        });
    };

    Filter.prototype.showKeyEvents = function() {
        bonzo(this.articleContainer).toggleClass('show-only-key-events');
    };

    return Filter;
});