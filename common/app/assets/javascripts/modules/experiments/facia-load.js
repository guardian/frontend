define([
    'ajax',
], function (
    ajax
) {

    return function() {
        ajax({
            url: 'http://' + window.location.host + '/facia' + window.location.pathname + window.location.search,
            type: 'text' // don't parse
        }).always(function(resp) {
            resp = null; // help the garbage collector?
        });
    };

});
