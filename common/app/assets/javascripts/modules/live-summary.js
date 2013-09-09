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

        // common.mediator.on('modules:autoupdate:loaded', function() {
        //     self.deportLatestSummary.call(self);
        // });
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
