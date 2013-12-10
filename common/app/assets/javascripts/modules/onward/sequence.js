define([
    'bean',
    'utils/ajax',
    'utils/mediator',
    'lodash/collections/filter',
    'utils/storage',
    'modules/onward/history'
], function(
    bean,
    ajax,
    mediator,
    _filter,
    storage,
    History
    ){

    var context,
        store = storage.session,
        sequence = [],
        prefixes = {
            contextName: 'gu.context.name',
            contextPath: 'gu.context.path',
            sequence: 'gu.sequence'
        };

    function set(type, item) {
        store.set(prefixes[type], item);
        mediator.emit('modules:sequence:'+ type +':loaded', item);
    }

    function get(type) {
        return store.get(prefixes[type]);
    }

    function getSequence() { return get('sequence'); }
    function getContext() { return { name: get('contextName'), path: get('contextPath') }; }
    function removeContext() { return store.remove(prefixes.contextPath); }

    function dedupeSequence(sequence) {
        var history = new History({}).get().map(function(i){
            return i.id;
        });
        return _filter(sequence, function(item) {
            return history.indexOf(item.url) < 0;
        });
    }

    function loadSequence(context) {
        ajax({
            url: '/' + context.path + '.json',
            crossOrigin: true
        }).then(function (json) {
            if(json && 'trails' in json) {
                set('sequence', {
                    name: context.name,
                    items: dedupeSequence(json.trails)
                });
                removeContext();
                mediator.emit('modules:sequence:loaded', getSequence());
            }
        }).fail(function(req) {
            mediator.emit('modules:error', 'Failed to load sequence: ' + req.statusText, 'modules/onwards/sequence.js');
        });
    }

    function bindListeners() {
        mediator.on('module:clickstream:click', function(clickSpec){
            if (clickSpec.sameHost && !clickSpec.samePage && clickSpec.linkContextPath) {
                set('context.path', clickSpec.linkContextPath);
                set('context.name', clickSpec.linkContextName);
            }
        });
    }

    function init() {
        var context = getContext();
        if(context.path !== null) {
            loadSequence(context);
        } else {
            mediator.emit('modules:sequence:loaded', getSequence());
        }
        bindListeners();
    }

    return {
        getSequence : getSequence,
        getContext : getContext,
        init: init
    };
});
