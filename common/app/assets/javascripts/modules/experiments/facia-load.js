define([
    'ajax',
], function (
    ajax
) {

    return function() {
        ajax({
            url: window.location.pathname,
            type: 'text', // don't parse
            headers: { 'X-Gu-Facia': 'true' }
        }).always(function(resp) {
            resp = null;  // help the garbage collector?
        });
    }

});
