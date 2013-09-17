define([
    'ajax',
], function (
    ajax
) {

    return function() {
        ajax({
            url: '/facia' + window.location.pathname,
            type: 'text' // don't parse
        }).always(function(resp) {
            resp = null; // help the garbage collector?
        });
    };

});
