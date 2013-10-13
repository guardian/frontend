define([
    'knockout',
    'models/common',
    'models/authedAjax',
    'models/collection',
    'models/article',
    'models/latestArticles',
    'models/contentApi',
    'models/ophanApi',
    'models/viewer',
], function(
    knockout,
    common,
    authedAjax,
    Collection,
    Article,
    LatestArticles,
    contentApi,
    ophanApi,
    viewer
) {
    var clipboardEl = document.querySelector('#clipboard'),
        loc = window.location;

    return function(selector) {

        var self = this,
            fromList,
            model = {
                latestArticles: new LatestArticles(),
                clipboard:      knockout.observableArray(),
                collections:    knockout.observableArray(),
                configs:        knockout.observableArray(),
                config:         knockout.observable(),

                viewer:         viewer,
                showViewer:     knockout.observable(),

                actions: {
                    flushClipboard: flushClipboard,
                    toggleViewer:   toggleViewer
                }
            };

        function fetchConfigsList() {
            return authedAjax({
                url: common.config.apiBase + '/config'
            }).then(function(resp) {
                if (!(_.isArray(resp) && resp.length > 0)) {
                    window.alert("Oops, no page definitions were found! Please contact support.");
                    return;
                }
                model.configs(resp.sort());
            });
        };

        function getConfig() {
            return common.util.queryParams().front;
        }

        function setConfig(id) {
            history.pushState({}, "", loc.pathname + '?' + common.util.ammendedQueryStr('front', id));
            renderCollections();
        }

        function renderConfig() {
            model.config(getConfig());
        }

        function renderCollections() {
            model.collections.removeAll();

            if (!getConfig()) { return; }

            authedAjax({
                url: common.config.apiBase + '/config/' + getConfig()
            })
            .then(function(collections){
                model.collections(
                    (collections || []).map(function(collection){
                        return new Collection(collection);
                    })
                );
                //connectSortableLists();
            });
        }

        function startPoller() {
            var period = common.config.collectionsPollMs || 60000;

            setInterval(function(){
                model.collections().forEach(function(list, index){
                    setTimeout(function(){
                        list.refresh();
                    }, index * period / (model.collections().length + 1)); // stagger requests
                });
            }, period);

            startPoller = function() {}; // make idempotent
        }

        function toggleViewer() {
            model.showViewer(!model.showViewer());
            if (model.showViewer()) {
                model.viewer.render();
            }
        }

        function flushClipboard() {
            model.clipboard.removeAll();
            clipboardEl.innerHTML = '';
        };

        knockout.bindingHandlers.makeDropabble = {
            init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

                element.addEventListener('dragstart', function(event){
                    fromList = knockout.dataFor(element);
                }, false);

                element.addEventListener('dragover', function(event){
                    event.preventDefault();
                    var targetList = knockout.dataFor(element);
                    var targetItem = knockout.dataFor(event.target);
                    targetList.underDrag(targetItem.constructor !== Article);
                    _.each(targetList.articles(), function(item) {
                        var underDrag = (item === targetItem);
                        if (underDrag !== item.state.underDrag()) {
                            item.state.underDrag(underDrag);
                        }
                    });
                }, false);

                element.addEventListener('dragleave', function(event){
                    event.preventDefault();
                    var targetList = knockout.dataFor(element);
                    var targetItem = knockout.dataFor(event.target);
                    targetList.underDrag(false);
                    _.each(targetList.articles(), function(item) {
                        if (item.state.underDrag()) {
                            item.state.underDrag(false);
                        }
                    });
                }, false);

                element.addEventListener('drop', function(event){
                    var targetList = knockout.dataFor(element),
                        targetItem = knockout.dataFor(event.target),
                        item = event.testData ? event.testData : event.dataTransfer.getData('Text'),
                        position,
                        offset = 0,
                        insertAt;

                    event.preventDefault();
                    
                    targetList.underDrag(false);
                    _.each(targetList.articles(), function(item) {
                        item.state.underDrag(false);
                    });

                    if (targetItem.constructor !== Article) {
                        targetItem = _.last(targetList.articles ? targetList.articles() : undefined);
                        offset  = 0 + !!targetItem;
                    }

                    position = targetItem && targetItem.meta ? targetItem.meta.id() : undefined;
                   
                    if (common.util.urlHost(item).indexOf('google') > -1) {
                        item = decodeURIComponent(common.util.parseQueryParams(item).url);
                    }

                    item = common.util.urlAbsPath(item);

                    if (item === position) { // adding an item next to itself
                        return;
                    }

                    // for display only:
                    if (targetList.articles) {                    
                        insertAt = targetList.articles().indexOf(targetItem) + offset;
                        insertAt = insertAt === -1 ? targetList.articles().length : insertAt;
                        targetList.articles.splice(insertAt, 0, new Article({id: item}))
                        
                        contentApi.decorateItems(targetList.articles());
                        ophanApi.decorateItems(targetList.articles());
                    }

                    if (!targetList.collection) { // this is a non-collection list, e.g. a clipboard
                        return;
                    }

                    saveChanges(
                        'post',
                        targetList.collection,
                        {
                            item:     item,
                            position: position,
                            after:    offset > 0 ? true : undefined,
                            live:     targetList.collection.state.liveMode(),
                            draft:   !targetList.collection.state.liveMode(),
                            itemMeta: {
                                group: targetList.group
                            }
                        }
                    )

                    if (!fromList || fromList === targetList) {
                        return;
                    }

                    // for display only:
                    fromList.articles.remove(function(article) {
                        return article.meta.id() === item;
                    })

                    saveChanges(
                        'delete',
                        fromList.collection,
                        {
                            item:   item,
                            live:   fromList.collection.state.liveMode(),
                            draft: !fromList.collection.state.liveMode()
                        }
                    )
                }, false);
            }
        };

        function saveChanges(method, collection, data) {
            collection.state.loadIsPending(true);
            authedAjax({
                url: common.config.apiBase + '/collection/' + collection.id,
                type: method,
                data: JSON.stringify(data)
            }).then(function() {
                collection.load();
            });
        };

        knockout.bindingHandlers.sparkline = {
            update: function (element, valueAccessor, allBindingsAccessor, model) {
                var graphs = knockout.utils.unwrapObservable(valueAccessor()),
                    max;

                if (!_.isArray(graphs)) { return; };
                max = _.max(_.pluck(graphs, 'max'));
                if (!max) { return; };

                _.each(_.toArray(graphs).reverse(), function(graph, i){
                    $(element).sparkline(graph.data, {
                        chartRangeMax: max,
                        defaultPixelsPerValue: graph.data.length < 50 ? graph.data.length < 30 ? 3 : 2 : 1,
                        height: Math.round(Math.max(10, Math.min(40, max))),
                        lineColor: '#' + graph.color,
                        spotColor: false,
                        minSpotColor: false,
                        maxSpotColor: false,
                        lineWidth: graph.activity || 1,
                        fillColor: false,
                        composite: i > 0
                    });
                });
            }
        };

        model.config.subscribe(function(config) {
            var section = (config || '').split('/')[1]; // assumes ids are formed "edition/section/.."
            model.latestArticles.section(common.config.sectionSearches[section || 'default'] || section);
            setConfig(config);
        });

        this.init = function() {
            fetchConfigsList()
            .then(function(){
                renderConfig();
                window.onpopstate = renderConfig;

                knockout.applyBindings(model);

                //startPoller();

                model.latestArticles.search();
                //model.latestArticles.startPoller();
            });
        };

    };

});
