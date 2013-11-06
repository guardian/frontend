define([
    'bean',
    'ajax',
    'utils/mediator',
    'lodash/arrays/difference',
    'modules/storage',
    'modules/onward/history'
], function(
    bean,
    ajax,
    mediator,
    _difference,
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
            return el.shortUrl.replace('http://gu.com', '');
        });
    }

    function dedupeSequence(sequence) {
        return _difference(sequence, new History({}).get().map(function(i){
            return i.id;
        }));
    }

    function loadSequence(context) {
        ajax({
            url: '/' + context + '.json',
            crossOrigin: true
        }).then(function (json) {
            if(json && 'trails' in json) {
                set('sequence', dedupeSequence(cleanSequence(json.trails)));
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

    function init() {
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
