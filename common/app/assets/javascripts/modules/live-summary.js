/*
    Module: live-summary.js
    Description: Display latest summary to the user
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

    function Summary(context) {
        this.context = context || document;
        this.maxSummaryHeight = 250;
        this.expandableClass = 'live-summary--expandable';
        this.articleContainer = this.context.getElementsByClassName('js-article__container')[0];
        this.summaries = common.toArray(this.articleContainer.getElementsByClassName('is-summary'));
        this.summaryContainers = common.toArray(this.context.getElementsByClassName('js-article__summary'));
        this.hiddenSummaryContainers = common.toArray(this.context.querySelectorAll('.js-article__summary.is-hidden'));
        this.placeholders = common.toArray(this.context.getElementsByClassName('js-summary-placeholder'));
    }

    Summary.prototype.init = function() {
        var self = this;

        this.deportLatest();
        this.render();

        common.mediator.on('modules:autoupdate:loaded', function() {
            self.deportLatest.call(self);
            self.render.call(self);
        });
        bean.on(window, 'resize', common.debounce(function() {
            self.summaryContainers.forEach(function(element, index) {
                self.expandable(element, self.maxSummaryHeight, self.expandableClass);
            });
        }, 100));
    };

    Summary.prototype.render = function() {
        var self = this;

        if (this.summaries.length > 0 && this.hiddenSummaryContainers.length > 0) {
            this.hiddenSummaryContainers.forEach(function(element, index) {
                bonzo(element).removeClass('is-hidden');
                self.expandable(element, self.maxSummaryHeight, self.expandableClass);
            });
            bonzo(self.summaries[0]).addClass('is-hidden');
        }
    };

    Summary.prototype.deportLatest = function() {
        var content;

        // TODO: Verify if summary has actually been updated
        if (this.summaries.length > 0) {
            content = this.summaries[0].innerHTML;

            this.placeholders.forEach(function(element, index) {
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
