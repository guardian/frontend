define([
    'Reqwest',
    'common',
    'bean',
    'bonzo',
    'Knockout',
    'js!html5sortable'
], function(
    reqwest,
    common,
    bean,
    bonzo,
    knockout
) {

    return function(selector) {

        var self = this,
            doc = document,
            searchSelector = selector + '__search',
            articlesSelector = selector + '__articles',
            viewModel = {};

        viewModel.list = knockout.observableArray();

        function makeSortable() {
            $(articlesSelector).sortable('destroy').unbind();
            $(articlesSelector).sortable().bind('sortupdate', function(event, params) {
                saveDelta(getDelta(params.item.context.dataset.url));
            });
        };

        function getDelta(url) {
            var item = url ? $("[data-url='" + url + "']")[0] : undefined,
                sibling,
                delta = {
                    add: url
                };

            if (!item) { return; }

            sibling = $(item).next()[0];

            if (sibling && sibling.dataset.url) {
                delta.before = sibling.dataset.url;
            } else {
                sibling = $(item).prev()[0];
                if (sibling && sibling.dataset.url) {
                    delta.after = sibling.dataset.url;
                }
            } 

            return delta;
        };

        function saveDelta(delta) {
            if (!delta) { return; }

            console.log(delta);

            /*
            reqwest({
                url: '/fronts/list/' + selector.replace(/[^\w]/, ''),
                type: 'json',
                method: 'post',
                data: delta
            }).then(
                function(resp) {
                    // update the viewModel
                }
            );
            */
        }

        function searchInit() {

            bean.one(doc.querySelector(searchSelector), 'keydown', function() {
                $(searchSelector).typeahead({
                    matcher: function() {
                        return true;
                    },
                    sorter: function(items) {
                        return items;
                    },
                    updater: function(item) {
                        self.addItem(item);
                        saveDelta(getDelta(item));
                        makeSortable();
                    },
                    source: function(query, process) {
                        reqwest({
                            jsonpCallback: 'callback',
                            jsonpCallbackName: 'search',
                            url: 'http://content.guardianapis.com/search?format=json&show-fields=all&pageSize=5&q=' + query,
                            type: 'jsonp',
                            success: function(resp) {
                                var articles = resp.response.results.map(function(article) {
                                    return article.id;
                                });
                                process(articles);
                            }
                        });
                    }
                });
            });

        }

        this.addItem = function(item) {
            if (!item) { return; }
            viewModel.list.push({
                url: item
            });
        };

        this.loadList = function(list) {
            if (!list || !list.length) { return; }
            viewModel.list.removeAll();
            list.forEach(function(item){
                self.addItem(item);
            });
        };

        this.init = function(callback) {

            searchInit();

            /*
            reqwest({
                url: '/fronts/top-stories',
                type: 'json'
            }).then(
                function(resp) {
                    this.loadList(resp.articles);
                }
            );
            */
            // Load a dummy list instead
            this.loadList([
                "society/2013/jun/25/society-daily-email",
                "environment/2013/jun/25/obama-unveil-first-us-climate-strategy",
                "sport/2013/jun/25/lions-melbourne-rebels-live-report",
                "tv-and-radio/video/2013/jun/25/question-time-russell-brand-video-review",
                "sport/that-1980s-sports-blog/2013/jun/25/lions-battled-bollymore-test-australia-1989",
                "uk/2013/jun/25/ian-brady-tells-tribunal-not-psychotic",
                "business/2013/jun/25/eurozone-crisis-greece-reshuffle-cabinet",
                "politics/blog/2013/jun/25/mervyn-king-treasury-committee-live-blog",
                "business/2013/jun/24/eurozone-crisis-bond-yields-spain-greece",
                "global-development/2013/jun/25/central-american-farmers-coyotes"
            ]); 

            knockout.applyBindings(viewModel);

            makeSortable();
        };


    };

});
