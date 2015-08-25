import ko from 'knockout';
import _ from 'underscore';
import BaseWidget from 'widgets/base-widget';
import autocomplete from 'modules/auto-complete';
import debounce from 'utils/debounce';
import {CONST} from 'modules/vars';

var typeBounceSym = Symbol();
var setFilter = Symbol();
var preventUpdate = Symbol();

export default class AutoComplete extends BaseWidget {
    constructor(opts) {
        super();

        this.suggestions = ko.observableArray();
        this.filterType = ko.observable();
        this.filterTypes = ko.observableArray(_.values(CONST.filterTypes) || []);
        this.alertMessage = ko.observable(false);
        this.filter = ko.observable('');
        this.subscribeOn(this.filter, () => {
            if (!this[preventUpdate]) {
                this.type();
            }
        });
        this[setFilter] = (suggestion) => {
            // Prevent types update
            this[preventUpdate] = true;
            this.filter(suggestion && suggestion.id ? suggestion.id : suggestion);
            this[preventUpdate] = false;
        };
        this.placeholder = ko.pureComputed(() => {
            return (this.filterType() || {}).placeholder;
        });
        this.open = ko.pureComputed(() => {
            return this.alertMessage() || this.suggestions().length;
        });
        this.paginationInProgress = ko.observable(false);
        this.currentPage = ko.observable(1);
        this.totalPages = ko.observable(1);
        this.hasMoreSuggestions = ko.pureComputed(() => {
            return this.suggestions().length > 0 && (this.currentPage() < this.totalPages());
        });

        this[typeBounceSym] = debounce(() => {
            return autocomplete(this.state());
        }, CONST.searchDebounceMs);

        if (opts.parent && opts.parent.registerChild) {
            opts.parent.registerChild(this);
            this.listenOn(opts.parent, 'clear', () => {
                this.clear();
                this.emit('change', this.state());
            });
        }
    }

    select(suggestion) {
        this[setFilter](suggestion);
        this.suggestions.removeAll();
        this.emit('change', this.state());
    }

    state() {
        return {
            query: this.filter(),
            path: this.getPath(),
            param: (this.filterType() || {}).param
        };
    }

    getPath() {
        return (this.filterType() || {}).path;
    }

    clear() {
        this.suggestions.removeAll();
        this.alertMessage(false);
        this[setFilter]('');
    }

    type() {
        if (this.filter()) {
            this.alertMessage('searching for ' + this.filter() + '...');
            this[typeBounceSym]().then(res => {
                this.alertMessage(false);
                if (res && res.results && res.results.length) {
                    this.currentPage(res.currentPage || 1);
                    this.totalPages(res.pages || 1);
                    this.suggestions(res.results);
                } else {
                    this.alertMessage('...sorry, no ' + this.getPath() + ' found.');
                }
            })
            .catch(ex => {
                this.alertMessage(ex.message);
            })
            .then(() => this.emit('update'));
        } else {
            this.select('');
        }
    }

    nextPage() {
        var state = this.state();
        state.page = this.currentPage() + 1;
        this.paginationInProgress(true);

        autocomplete(state).then(res => {
            if (res && res.results && res.results.length) {
                this.currentPage(res.currentPage || 1);
                this.totalPages(res.pages || 1);
                this.suggestions(this.suggestions().concat(res.results));
            } else {
                this.alertMessage('...sorry, no ' + this.getPath() + ' found.');
            }
        })
        .catch(ex => {
            this.alertMessage(ex.message);
        })
        .then(() => {
            this.paginationInProgress(false);
            this.emit('update');
        });
    }
}
