/* global _: true */
define([
    'modules/vars',
    'utils/internal-content-code',
    'utils/query-params',
    'utils/url-abs-path',
    'models/collections/article',
    'modules/auto-complete',
    'modules/cache',
    'modules/authed-ajax',
    'knockout'
], function (
    vars,
    internalContentCode,
    queryParams,
    urlAbsPath,
    Article,
    autoComplete,
    cache,
    authedAjax,
    ko
) {
    function dateYyyymmdd() {
        var d = new Date();
        return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(function(p) { return p < 10 ? '0' + p : p; }).join('-');
    }

    return function(options) {

        var self = this,
            deBounced,
            opts = options || {},
            counter = 0,
            container = document.querySelector('.latest-articles');

        this.articles = ko.observableArray();

        this.term = ko.observable(queryParams().q || '');
        this.term.subscribe(function() { self.search(); });
        this.isTermAnItem = function() { return (self.term() || '').match(/\//); };

        this.filter     = ko.observable();
        this.filterType = ko.observable();
        this.filterTypes= ko.observableArray(_.values(opts.filterTypes) || []);

        this.showingDrafts = ko.observable(false);
        this.showDrafts = function() {
            self.showingDrafts(true);
            self.search();
        };
        this.showLive = function() {
            self.showingDrafts(false);
            self.search();
        };

        this.suggestions = ko.observableArray();

        this.page = ko.observable(1);

        this.setFilter = function(item) {
            self.filter(item && item.id ? item.id : item);
            self.suggestions.removeAll();
            self.search();
        };

        this.clearFilter = function() {
            self.filter('');
            self.suggestions.removeAll();
        };

        this.setSection = function(str) {
            self.filterType(opts.filterTypes.section);
            self.setFilter(str);
            self.clearTerm();
        };

        this.clearTerm = function() {
            self.term('');
        };

        this.autoComplete = function() {
            autoComplete({
                query:    self.filter(),
                path:    (self.filterType() || {}).path
            })
            .progress(self.suggestions)
            .then(self.suggestions);
        };

        // Grab articles from Content Api
        this.search = function(opts) {
            var count = counter += 1;

            opts = opts || {};

            if (!vars.model.switches()['facia-tool-draft-content']) {
                self.showingDrafts(false);
            }

            clearTimeout(deBounced);
            deBounced = setTimeout(function(){

                var url, propName;

                if (!opts.noFlushFirst) {
                    self.flush('searching...');
                }

                // If term contains slashes, assume it's an article id (and first convert it to a path)
                if (self.isTermAnItem()) {
                    self.term(urlAbsPath(self.term()));
                    url = vars.CONST.apiSearchBase + '/' + self.term() + '?show-fields=all&format=json';
                    propName = 'content';
                } else {
                    url  = vars.CONST.apiSearchBase + '/search?show-fields=all&format=json';
                    url += self.showingDrafts() ?
                        '&content-set=preview&order-by=oldest&use-date=scheduled-publication&from-date=' + dateYyyymmdd() :
                        '&content-set=web-live&order-by=newest';
                    url += '&page-size=' + (vars.CONST.searchPageSize || 25);
                    url += '&page=' + self.page();
                    url += self.term() ? '&q=' + encodeURIComponent(self.term().trim().replace(/ +/g,' AND ')) : '';
                    url += self.filter() ? '&' + self.filterType().param + '=' + encodeURIComponent(self.filter()) : '';
                    propName = 'results';
                }

                authedAjax.request({
                    url: url
                }).then(function(data) {
                    var rawArticles = data.response && data.response[propName] ? [].concat(data.response[propName]) : [];

                    if (count !== counter) { return; }

                    self.flush(rawArticles.length === 0 ? '...sorry, no articles were found.' : '');

                   _.chain(rawArticles)
                    .filter(function(article) { return article.fields && article.fields.headline; })
                    .each(function(article) {
                        var icc = internalContentCode(article);

                        article.id = icc;
                        article.uneditable = true;

                        cache.put('contentApi', icc, article);
                        self.articles.push(new Article(article));
                    });
                });
            }, 300);

            return true; // ensure default click happens on all the bindings
        };

        this.flush = function(message) {
            self.articles.removeAll();
            // clean up any dragged-in articles
            container.innerHTML = message || '';
        };

        this.refresh = function() {
            self.page(1);
            self.search();
        };

        this.reset = function() {
            self.page(1);
            this.clearTerm();
            this.clearFilter();
        };

        this.pageNext = function() {
            self.page(self.page() + 1);
            self.search();
        };

        this.pagePrev = function() {
            self.page(_.max([1, self.page() - 1]));
            self.search();
        };

        this.startPoller = function() {
            setInterval(function(){
                if (self.page() === 1) {
                    self.search({noFlushFirst: true});
                }
            }, vars.CONST.latestArticlesPollMs || 60000);

            this.startPoller = function() {}; // make idempotent
        };

    };
});


