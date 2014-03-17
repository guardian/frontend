define([
    'common/modules/component',
    'common/$',
    'bonzo'
], function(
    component,
    $,
    bonzo
) {

var MatchList = function(type, filter) {
    this.endpoint += ['football', filter, type].filter(function(e) { return e; }).join('/') +'.json';
};
component.define(MatchList);

MatchList.prototype.endpoint = '/';
MatchList.prototype.autoupdated = true;
MatchList.prototype.updateEvery = 10;

MatchList.prototype.prerender = function() {
    var elem = this.elem;
    $('.football-team__form', elem).remove();
    $('.date-divider', elem).remove();
    $(this.elem).addClass('table--small');

    if ($('.table__caption', this.elem).length === 0) {
        bonzo(bonzo.create('<caption class="table__caption">Live scores</caption>')).each(function(el) {
            $('.football-matches', elem).prepend(el);
        });
    }
};

MatchList.prototype.autoupdate = function(elem) {
    var updated = $('.football-match', elem),
        self = this,
        $match, $updated;

    $('.football-match', this.elem).each(function(match, i) {
        $match = bonzo(match).removeClass('football-match--updated');
        $updated = bonzo(updated[i]);

        ['score-home', 'score-away', 'match-status'].forEach(function(state) {
            state = 'data-'+ state;
            if ($updated.attr(state) !== $match.attr(state)) {
                $match.replaceWith($updated.addClass('football-match--updated'));
                self.prerender();
            }
        });
    });
};

return MatchList;

}); // define
