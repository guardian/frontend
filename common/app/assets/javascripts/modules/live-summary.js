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
        this.placeholder = '.js-summary-placeholder';
        this.articleContainer = this.context.getElementsByClassName('js-article__container')[0];
    }

    Summary.prototype.init = function() {
        var self = this;

        this.deportLatestSummary();

        common.mediator.on('modules:autoupdate:loaded', function() {
            self.deportLatestSummary.call(self);
        });
    };

    Summary.prototype.deportLatestSummary = function() {
        var summaries = this.articleContainer.getElementsByClassName('is-summary');

        // TODO: Verify if summary has actually been updated
        if (summaries.length) {
            bonzo(this.placeholder, this.context).html(summaries[0].innerHTML);
        }
    };

    return Summary;
});
