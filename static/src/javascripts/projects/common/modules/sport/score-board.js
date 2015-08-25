define([
    'bonzo',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/component',
    'text!common/views/sport/score-container.html'
], function (
    bonzo,
    detect,
    template,
    component,
    scoreContainerHtml
) {
    /* Parameters:
        - context.pageType      - 'report', 'stats'
        - context.parent        - the bonzo element that the placeholder, and eventually score, will attach to.
        - context.autoupdated   - true if the scoreboard should update every 30 or 60 seconds, depending on device.
    */
    function ScoreBoard (context) {

        this.pageType = context.pageType;

        this.placeholder = bonzo.create(template(scoreContainerHtml, {
            loadingState: this.pageType !== 'report' ? ' score__loading--live' : ''
        }))[0];

        context.parent.after(this.placeholder);
        this.autoupdated = context.autoupdated;
        this.updateEvery = detect.isBreakpoint({ min: 'desktop' }) ? 30 : 60;
    }

    component.define(ScoreBoard);

    ScoreBoard.prototype.componentClass = 'match-summary';
    ScoreBoard.prototype.responseDataKey = 'matchSummary';

    ScoreBoard.prototype.prerender = function () {
        this.placeholder.innerHTML = '';
    };

    ScoreBoard.prototype.ready = function () {
        this.setState(this.pageType);
    };

    ScoreBoard.prototype.load = function (endpoint, key) {
        this.endpoint = endpoint;

        this.fetch(this.placeholder, key);
    };

    return ScoreBoard;

}); // define
