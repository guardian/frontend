/*
    Module: live-summary.js
    Description: Display latest summary to the user
*/
define([
    'common',
    'bonzo'
], function (
    common,
    bonzo
) {
    'use strict';

    function Summary(context) {
        this.context = context || document;
        this.maxSummaryHeight = 250;
        this.expandableClass = 'live-summary--expandable';
        this.articleContainer = this.context.getElementsByClassName('js-article__container')[0];
    }

    Summary.prototype.init = function() {
        var self = this;

        this.deportLatest();
        this.render();

        common.mediator.on('modules:autoupdate:loaded', function() {
            self.render.call(self);
        });
    };

    Summary.prototype.render = function() {
        var self = this,
            summaries = common.toArray(this.articleContainer.getElementsByClassName('is-summary')),
            hiddenSummaryContainers = common.toArray(this.context.querySelectorAll('.js-article__summary.is-hidden'));

        if (summaries.length > 0 && hiddenSummaryContainers.length > 0) {
            hiddenSummaryContainers.forEach(function(element, index) {
                bonzo(element).removeClass('is-hidden');
                self.expandable(element, self.maxSummaryHeight, self.expandableClass);
            });
            bonzo(summaries[0]).addClass('is-hidden');
        }
    };

    Summary.prototype.deportLatest = function() {
        var summaries = common.toArray(this.articleContainer.getElementsByClassName('is-summary')),
            content,
            placeholders;

        // TODO: Verify if summary has actually been updated
        if (summaries.length > 0) {
            content = summaries[0].innerHTML;
            placeholders = common.toArray(this.context.getElementsByClassName('js-summary-placeholder'));

            placeholders.forEach(function(element, index) {
                bonzo(element).html(content);
            });
        }
    };

    Summary.prototype.expandable = function(element, maxElementHeight, expandableClass) {
        var $element = bonzo(element);

        if (element.offsetHeight > maxElementHeight) {
            $element.addClass(expandableClass);
        } else {
            $element.removeClass(expandableClass);
        }
    };

    return Summary;
});
