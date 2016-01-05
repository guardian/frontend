define([
    'bonzo',
    'common/utils/detect',
    'common/utils/$',
    'common/modules/component',
    'ldsh!common/views/sport/score-container.html'
], function (
    bonzo,
    detect,
    $,
    component,
    scoreContainerHtml
) {
    /* Parameters:
        - context.pageType          - one of 'minbymin', 'preview', 'report', 'stats'
        - context.parent            - the bonzo element that the placeholder, and eventually score, will attach to.
        - context.autoupdated       - true if the scoreboard should update every 30 or 60 seconds, depending on device.
        - context.responseDataKey   - the key of the ajax-loaded json object that maps to the scoreboard html.
        - context.endpoint          - the ajax endpoint which will provide html scores inside a json object.
    */
    function ScoreBoard(context) {
        this.pageType = context.pageType;
        this.parent = context.parent;

        this.placeholder = bonzo.create(scoreContainerHtml({
            loadingState: this.pageType !== 'report' ? ' score__loading--live' : ''
        }))[0];

        if (this.pageType === 'report') {
            context.parent.after(this.placeholder);
        } else {
            context.parent.addClass('u-h').before(this.placeholder);
        }

        // These parameters configure the way the Component super class fetches new score html.
        this.endpoint = context.endpoint;
        this.autoupdated = context.autoupdated;
        this.responseDataKey = context.responseDataKey;
        this.updateEvery = detect.isBreakpoint({ min: 'desktop' }) ? 30 : 60;
    }

    component.define(ScoreBoard);

    ScoreBoard.prototype.componentClass = 'match-summary';

    ScoreBoard.prototype.prerender = function () {
        var scoreLoadingPlaceholder = $('.score__loading', $(this.placeholder));
        if (scoreLoadingPlaceholder.length) {
            scoreLoadingPlaceholder.remove();
        }
    };

    ScoreBoard.prototype.ready = function () {
        this.setState(this.pageType);
    };

    // Load the first score html component from ajax, and any subsequent score updates from the same endpoint.
    ScoreBoard.prototype.load = function () {
        this.fetch(this.placeholder);
    };

    // Load the first score html component from json, and any subsequent score updates from ajax.
    ScoreBoard.prototype.loadFromJson = function (html) {
        this.template = html;
        this.render(this.placeholder);
    };

    ScoreBoard.prototype.error = function () {
        this.placeholder.innerHTML = '';
        this.parent.removeClass('u-h');
    };

    return ScoreBoard;

}); // define
