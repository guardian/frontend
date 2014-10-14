define([
    'common/modules/component'
], function (
    component
) {

    var ScoreBoard = function () {};
    component.define(ScoreBoard);
    ScoreBoard.prototype.componentClass = 'match-summary';
    ScoreBoard.prototype.responseDataKey = 'matchSummary';

    return ScoreBoard;

}); // define
