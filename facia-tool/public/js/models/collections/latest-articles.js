import ko from 'knockout';
import _ from 'underscore';
import BaseClass from 'models/base-class';
import Article from 'models/collections/article';
import * as cache from 'modules/cache';
import * as capi from 'modules/content-api';
import {CONST} from 'modules/vars';
import {combine} from 'utils/array';
import debounce from 'utils/debounce';
import internalPageCode from 'utils/internal-page-code';
import mediator from 'utils/mediator';
import parseQueryParams from 'utils/parse-query-params';
import urlAbsPath from 'utils/url-abs-path';
import AutoComplete from 'widgets/autocomplete';

var pollerSym = Symbol();
var debounceSym = Symbol();
var fetchSym = Symbol();

class Latest extends BaseClass {
    constructor(options) {
        super();
        var opts = this.opts = options || {};

        var pageSize = CONST.searchPageSize || 25,
            showingDrafts = opts.showingDrafts;

        this.articles = ko.observableArray();
        this.message = ko.observable();

        this.term = ko.observable(parseQueryParams().q || '');
        this.term.subscribe(() => this.search());
        this.autocompleteValue = ko.observable({
            query: '',
            param: 'section'
        });
        this.autocompleteValue.subscribe(() => this.search());

        this.lastSearch = ko.observable({});

        this.page = ko.observable(1);
        this.totalPages = ko.observable(1);

        this.title = ko.computed(() => {
            var lastSearch = this.lastSearch(),
                title = 'latest';
            if (lastSearch && lastSearch.filter) {
                title += ' in ' + lastSearch.filter;
            }
            return title;
        }, this);

        this[debounceSym] = debounce(opts => {
            // TODO Phantom Babel bug
            if (!opts) { opts = {}; }
            if (!opts.noFlushFirst) {
                this.flush('searching...');
            }

            var request = {
                isDraft: showingDrafts(),
                page: this.page(),
                pageSize: pageSize,
                filter: this.autocompleteValue().query,
                filterType: this.autocompleteValue().param,
                isPoll: opts.isPoll
            };

            var term = this.term();
            // If term contains slashes, assume it's an article id (and first convert it to a path)
            if (this.isTermAnItem()) {
                term = urlAbsPath(term);
                this.term(term);
                request.article = term;
            } else {
                request.term = term;
            }

            return capi.fetchLatest(request);
        }, CONST.searchDebounceMs);

        this.showNext = ko.pureComputed(function () {
            return this.totalPages() > this.page();
        }, this);

        this.showPrev = ko.pureComputed(function () {
            return this.page() > 1;
        }, this);

        this.showTop = ko.pureComputed(function () {
            return this.page() > 2;
        }, this);
    }

    [fetchSym](request) {
        var loadCallback = this.opts.callback || function () {};

        this[debounceSym](request)
        .then(({
            results,
            pages,
            currentPage
        }) => {
            var scrollable = this.opts.container.querySelector('.scrollable'),
                initialScroll = scrollable.scrollTop;

            this.lastSearch(request);
            this.totalPages(pages);
            this.page(currentPage);

            if (results.length) {
                let newArticles = combine(results, this.articles(), compareArticles, createNewArticle, reuseOldArticle);
                this.articles(newArticles);
                this.message(null);
            } else {
                this.flush('...sorry, no articles were found.');
            }

            scrollable.scrollTop = initialScroll;
            loadCallback();
            this.emit('search:update');
        })
        .catch(error => {
            // TODO Phantom Babel bug
            var errMsg = (error || {}).message || 'Invalid CAPI result. Please try again';
            mediator.emit('capi:error', errMsg);
            this.flush(errMsg);
            loadCallback();
            this.emit('search:update');
        });
    }

    isTermAnItem() {
        return (this.term() || '').match(/\//);
    }

    registerChild(child) {
        if (child instanceof AutoComplete) {
            this.listenOn(child, 'change', value => {
                this.autocompleteValue(value);
            });
        }
    }

    clearTerm() {
        this.term('');
    }

    startPoller() {
        this[pollerSym] = setInterval(() => {
            if (this.page() === 1) {
                this.search({
                    noFlushFirst: true,
                    isPoll: true
                });
            }
        }, CONST.latestArticlesPollMs || 60000);

        this.startPoller = function() {}; // make idempotent
    }

    search(opts) {
        this.page(1);
        this[fetchSym](opts);

        return true; // ensure default click happens on all the bindings
    }

    flush(message) {
        this.articles.removeAll();
        this.message(message);
    }

    refresh() {
        this.page(1);
        this[fetchSym]();
    }

    reset() {
        this.page(1);
        this.clearTerm();
        this.emit('clear');
    }

    pageNext() {
        this.page(this.page() + 1);
        this[fetchSym]();
    }

    pagePrev() {
        this.page(_.max([1, this.page() - 1]));
        this[fetchSym]();
    }

    dispose() {
        super.dispose();
        this[debounceSym].dispose();
        clearInterval(this[pollerSym]);
    }
}

function compareArticles (one, two) {
    var oneId = one instanceof Article ? one.id() : internalPageCode(one);
    var twoId = two instanceof Article ? two.id() : internalPageCode(two);
    return oneId === twoId;
}

function createNewArticle (opts) {
    var icc = internalPageCode(opts);

    opts.id = icc;
    cache.put('contentApi', icc, opts);

    opts.uneditable = true;
    return new Article(opts, true);
}

function reuseOldArticle (oldArticle, newArticle) {
    oldArticle.props.webPublicationDate(newArticle.webPublicationDate);
    return oldArticle;
}

export default Latest;
