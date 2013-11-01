/*jshint multistr: true */
define([
    'common',
    'bean',
    'ajax',
    'modules/storage',
    'modules/onwards/history'
], function(
    common,
    bean,
    ajax,
    storage,
    History
    ){

    var context,
        sequence = [],
        prefixes = {
            context: 'gu.context',
            sequence: 'gu.sequence'
        },
        expiry = 10000;

    function set(type, item) {
        storage.set(prefixes[type], item, {
            expires: expiry + (new Date()).getTime()
        });
    }

    function get(type) {
        return storage.get(prefixes[type]);
    }

    function getSequence() { return get('sequence'); }
    function getContext() { return get('context'); }

    function bindListeners() {
        common.mediator.on('module:clickstream:click', function(clickSpec){
            if (clickSpec.sameHost && !clickSpec.samePage && clickSpec.linkContext) {
                set('context', clickSpec.linkContext);
            }
        });
    }

    function dedupeSequence(sequence, callback) {
        var hist = new History().get();



        callback(sequence);
    }

    function loadSequence(context) {
        ajax({
            url: '/' + context + '.json',
            crossOrigin: true
        }).then(function (json) {
            if(json && 'trails' in json) {
                dedupeSequence(json.trails, function(sequence) {
                    set('sequence', sequence);
                });
            }
        }).fail(function(req) {
            common.mediator.emit('modules:error', 'Failed to load sequence: ' + req.statusText, 'modules/onwards/sequence.js');
        });
    }

    function init(config) {
        var context = getContext();
        if(context !== null && getSequence() === null) {
            loadSequence(context);
        }
        bindListeners();
    }

    return {
        getSequence : getSequence,
        getContext : getContext,
        init: init
    };
});
