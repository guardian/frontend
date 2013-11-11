define([
    'common',
    'bean'
    ], function(
        common,
        bean
    ) {

    function AutoSignin() {}

    AutoSignin.prototype.getLinkTrackVars = function(extras) {
        extras = extras || [];

        var linkTrackVars = [
            'events',
            'prop4', 'prop6','prop8','prop10','prop13',
            'prop19','prop31','prop51','prop75',
            'eVar7', 'eVar8','eVar19','eVar31',
            'eVar51', 'eVar66'];

        return linkTrackVars.concat(extras).join(',');
    };

    AutoSignin.prototype.autoSignin = function(platform) {
        s.events = 'event51';

    };

});