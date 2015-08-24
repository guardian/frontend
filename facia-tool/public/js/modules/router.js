import EventEmitter from 'EventEmitter';
import {CONST} from 'modules/vars';
import Promise from 'Promise';
import parseQueryParams from 'utils/parse-query-params';
import serializeQueryParams from 'utils/serialize-query-params';

class Router extends EventEmitter {
    constructor(handlers, location, history) {
        super();
        this.location = location || window.location;
        this.history = history || window.history;

        this.populateFromLocation();
        this.handler = handlers[this.path];

        window.onpopstate = this.onpopstate.bind(this);
    }

    populateFromLocation() {
        var tokens = this.location.pathname.substring(1).split('/');
        this.priority = tokens[0] || CONST.defaultPriority;
        this.path = tokens[1] || 'fronts';
        this.params = parseQueryParams(this.location.search || '?');
    }

    onpopstate() {
        this.populateFromLocation();
        this.emit('change');
    }

    load(res) {
        var router = this,
            handler = router.handler;

        if (!handler) {
            return Promise.reject(new Error('Undefined route handler \'' + this.path + '\''));
        }

        return handler(router, res);
    }

    navigate(params) {
        var newSearchString = serializeQueryParams(this.params, params),
            oldSearchString = this.location.search.substring(1);

        if (newSearchString !== oldSearchString) {
            this.history.pushState({}, '', this.location.pathname + '?' + newSearchString);
            this.populateFromLocation();
        }
    }
}

export default Router;
