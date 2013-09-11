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
        this.articleContainer = this.context.getElementsByClassName('js-article__container')[0];
    }

    Summary.prototype.init = function() {
        var self = this;

        this.deportLatestSummary();
        this.findSummaries();

        common.mediator.on('modules:autoupdate:loaded', function() {
            self.findSummaries.call(self);
        });
    };

    Summary.prototype.findSummaries = function() {
        var summaries = common.toArray(this.articleContainer.getElementsByClassName('is-summary')),
            hiddenSummaryContainers = common.toArray(this.context.querySelectorAll('.js-article__summary.is-hidden'));

        if (summaries.length > 0 && hiddenSummaryContainers.length > 0) {
            hiddenSummaryContainers.forEach(function(element, index) {
                bonzo(element).removeClass('is-hidden');
            });
            // Hide latest summary
            summaries.forEach(function(element, index) {
                bonzo(element).removeClass('is-hidden');
            });
            bonzo(summaries[0]).addClass('is-hidden');
        }
    };

    Summary.prototype.deportLatestSummary = function() {
        var summaries = common.toArray(this.articleContainer.getElementsByClassName('is-summary')),
            summaryContent,
            summaryPlaceholders;

        // TODO: Verify if summary has actually been updated
        if (summaries.length > 0) {
            summaryContent = summaries[0].innerHTML;
            summaryPlaceholders = common.toArray(this.context.getElementsByClassName('js-summary-placeholder'));

            summaryPlaceholders.forEach(function(element, index) {
                bonzo(element).html(summaryContent);
            });
        }
    };

    return Summary;
});
