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
        var self = this,
            $summaries = common.$g('.is-summary', this.articleContainer),
            $hiddenSummaryPlaceholders = common.$g('.js-article__summary.u-h');

        if ($summaries.length > 0 && $hiddenSummaryPlaceholders.length > 0) {
            bonzo($hiddenSummaryPlaceholders).each(function(element, index) {
                bonzo(element).removeClass('u-h');
            });
            // Hide latest summary
            bonzo($summaries).each(function(element, index) {
                bonzo(element).removeClass('u-h');
            });
            bonzo($summaries[0]).addClass('u-h');
        }
    };

    Summary.prototype.deportLatestSummary = function() {
        var self = this,
            $summaries = common.$g('.is-summary', this.articleContainer),
            summaryContent;

        // TODO: Verify if summary has actually been updated
        if ($summaries.length > 0) {
            summaryContent = $summaries[0].innerHTML;

            bonzo(common.$g('.js-summary-placeholder', self.context)).each(function(element, index) {
                bonzo(element).html(summaryContent);
            });
        }
    };

    return Summary;
});
