define([
    'common/modules/component'
], function(
    component
) {

var MatchStats = function(endpoint) {
    this.endpoint = endpoint +'.json';
};
component.define(MatchStats);

return MatchStats;

}); // define
