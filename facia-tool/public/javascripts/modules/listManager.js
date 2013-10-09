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
                connectSortableLists();
            });
        }

        function connectSortableLists() {
            var selector = '.connectedList',
                sortables = $(selector),
                item,
                fromList,
                toList;

            sortables.sortable({
                helper: 'clone',
                opacity: 0.9,
                revert: 200,
                scroll: true,
                start: function(event, ui) {
                    common.state.uiBusy = true;

                    // Display the source item. (The clone gets dragged.)
                    sortables.find('.trail:hidden').show();

                    item = ui.item;
                    toList = fromList = item.parent();
                },
                stop: function(event, ui) {
                    var withinCollection = (fromList.data('collection') === toList.data('collection')),
                        toListPersists = toList.hasClass('persisted'),
                        fromListPersists = fromList.hasClass('persisted'),
                        index,
                        clone;

                    common.state.uiBusy = false;

                    // Save into toList
                    if(toListPersists) {
                        saveList({
                            listEl: toList,
                            itemEl: item
                        });
                    }

                    // Delete out of fromList, if we've dragged between lists
                    if(fromListPersists && toListPersists && !withinCollection) {
                        saveList({
                            listEl: fromList,
                            itemEl: item,
                            delete: true
                        });
                    }

                    // If dragging to/from a non-persisted list (e.g. clipboard, or latest articles)
                    // make a clone instead, and stick it in the toList, so that a "copy" is achieved
                    if (!(fromListPersists && toListPersists)) {
                        if(fromList !== toList) {
                            index = toList.children().index(item);
                            clone = $(ui.item[0]).clone(true).removeClass('box ui-draggable ui-draggable-dragging').addClass('box-clone');
                            toList.children(':eq(' + index + ')').after(clone);
                        }
                        // So that the original stays in place:
                        $(this).sortable('cancel');
                    }

                },
                change: function(event, ui) {
                    if(ui.sender) toList = ui.placeholder.parent();
                },
                connectWith: selector
            }).disableSelection();
        };

        function saveList(opts) {
            var $collection = opts.listEl.parent(),
                list,
                index,

                article     = knockout.dataFor(opts.itemEl[0]),
                group       = knockout.dataFor(opts.listEl[0]),
                collection  = knockout.dataFor($collection[0]),

                apiProps = {
                    item:   article.meta.id(),
                    live:   collection.state.liveMode(),
                    draft: !collection.state.liveMode()
                };

            if (!opts.delete) {
                list = $('.connectedList > .trail', $collection).map(function() {
                    return $(this).data('url')
                }).get();
                index = list.indexOf(article.meta.id());

                apiProps.position = list[index + 1];
                if (!apiProps.position && list[index - 1]) {
                    apiProps.position = list[index - 1];
                    apiProps.after = true;
                }

                apiProps.itemMeta = {
                    group: group.group
                }
            }

            authedAjax({
                url: common.config.apiBase + '/collection/' + collection.id,
                type: opts.delete ? 'delete' : 'post',
                data: JSON.stringify(apiProps)
            }).then(function(resp) {
                collection.load();
            });

            collection.state.loadIsPending(true);
        };

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

        function onDragOver(event) {
            event.preventDefault();
        }

        function onDrop(event) {
            var url = event.testData ? event.testData : event.dataTransfer.getData('Text');

            if(!url) { return true; }

            event.preventDefault();

            if (common.util.urlHost(url).indexOf('google') > -1) {
                url = decodeURIComponent(common.util.parseQueryParams(url).url);
            };

            model.clipboard.unshift(new Article({
                id: common.util.urlAbsPath(url)
            }));

            contentApi.decorateItems(model.clipboard());
            ophanApi.decorateItems(model.clipboard());
        }

        model.config.subscribe(function(config) {
            var section = (config || '').split('/')[1]; // assumes ids are formed "edition/section/.."
            model.latestArticles.section(common.config.sectionSearches[section || 'default'] || section);
            setConfig(config);
        });

        knockout.bindingHandlers.makeDropabble = {
            init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                element.addEventListener('dragover',  onDragOver,  false);
                element.addEventListener('drop',      onDrop,      false);
            }
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

        this.init = function() {
            fetchConfigsList()
            .then(function(){
                renderConfig();
                window.onpopstate = renderConfig;

                knockout.applyBindings(model);

                startPoller();

                model.latestArticles.search();
                model.latestArticles.startPoller();
            });
        };

    };

});
