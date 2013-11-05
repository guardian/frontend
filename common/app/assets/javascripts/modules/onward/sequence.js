/*jshint multistr: true */
define([
    'bean',
    'ajax',
    'utils/mediator',
    'modules/storage',
    'modules/onward/history'
], function(
    bean,
    ajax,
    mediator,
    storage,
    History
    ){

    var context,
        sequence = [],
        prefixes = {
            context: 'gu.context',
            sequence: 'gu.sequence'
        };

    function set(type, item) {
        storage.set(prefixes[type], item);
        mediator.emit('modules:sequence:'+ type +':loaded', item);
    }

    function get(type) {
        return storage.get(prefixes[type]);
    }

    function getSequence() { return get('sequence'); }
    function getContext() { return get('context'); }
    function removeContext() { return storage.remove(prefixes.context); }

    function cleanSequence(sequence) {
        return sequence.map(function(el) {
            return el.replace('http://gu.com', '');
        });
    }

    function dedupeSequence(sequence, callback) {
        var hist = new History({}).get();

        callback(sequence.filter(function(seqItem) {
            return !hist.some(function(histItem) {
                return seqItem === histItem.id;
            });
        }));
    }

    function loadSequence(context) {
        ajax({
            url: '/' + context + '.json',
            crossOrigin: true
        }).then(function (json) {
            if(json && 'trails' in json) {
                dedupeSequence(cleanSequence(json.trails), function(sequence) {
                    set('sequence', sequence);
                });
                removeContext();
            }
        }).fail(function(req) {
            mediator.emit('modules:error', 'Failed to load sequence: ' + req.statusText, 'modules/onwards/sequence.js');
        });
    }

    function bindListeners() {
        mediator.on('module:clickstream:click', function(clickSpec){
            if (clickSpec.sameHost && !clickSpec.samePage && clickSpec.linkContext) {
                set('context', clickSpec.linkContext);
            }
        });
    }

    function init(config) {
        var context = getContext();
        if(context !== null) {
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
