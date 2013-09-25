define([
    'Reqwest',
    'knockout',
    'models/fronts/common',
    'models/fronts/list',
    'models/fronts/article',
    'models/fronts/latestArticles',
    'models/fronts/contentApi',
    'models/fronts/ophanApi'
], function(
    reqwest,
    knockout,
    common,
    List,
    Article,
    LatestArticles,
    contentApi,
    ophanApi
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
                actions: {
                    unsetConfig: unsetConfig,
                    flushClipboard: flushClipboard
                }
            };

        function getConfig() {
            return [].concat(_.filter((common.util.queryParams().config || "").split(","), function(str){ return !!str; }));
        }

        function setConfig(ids) {
            history.pushState({}, "", loc.pathname + '?' + common.util.ammendedQueryStr('config', [].concat(ids).join(',')));
            renderCollections();
        }

        function unsetConfig() {
            model.config(undefined);
            setConfig([]);
        }

        function renderConfig() {
            model.config(getConfig()[0]);
        }

        function renderCollections() {
            model.collections.removeAll();
            getConfig().map(function(config){
                fetchConfig(config, function(collections){
                    model.collections(
                        (collections || []).map(function(collection){
                            return new List(collection);
                        })
                    );
                    connectSortableLists();
                });
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
                    var toListPersists = toList.hasClass('persisted'),
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
                    if(fromListPersists && fromList !==  toList) {
                        saveList({
                            listEl: fromList,
                            itemEl: item,
                            delete: true
                        });
                    }

                },
                change: function(event, ui) {
                    if(ui.sender) toList = ui.placeholder.parent();
                },
                connectWith: selector
            }).disableSelection();
        };

        function saveList(opts) {
            var itemId  = opts.itemEl.data('url'),
                isLive  = opts.listEl.hasClass('is-live'),
                method  = opts.delete ? 'delete' : 'post',
                listObj = knockout.dataFor(opts.listEl[0]),
                delta;

            if (!listObj || !listObj.id || !opts.itemEl.length || !itemId) { return; }

            delta = {
                item:   itemId,
                live:   isLive,
                draft: !isLive
            };

            if (method === 'post') {
                delta.position = opts.itemEl.next().data('url');
                if (!delta.position) {
                    var numOfItems = $("[data-url]", opts.listEl).length;
                    if (numOfItems > 1) {
                        delta.position = $("[data-url]", opts.listEl).eq(numOfItems - 2).data('url');
                        delta.after = true;
                    }
                }
            }

            listObj.state.loadIsPending(true);

            reqwest({
                method: method,
                url: common.config.apiBase + '/collection/' + listObj.id,
                type: 'json',
                contentType: 'application/json',
                data: JSON.stringify(delta)
            }).always(function(resp) {
                listObj.load();
            });
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

        function fetchConfigs(callback) {
            reqwest({
                url: common.config.apiBase + '/config',
                type: 'json'
            }).then(
                function(resp) {
                    if (!_.isArray(resp) || resp.length === 0) {
                        window.console.log("ERROR: No configs were found");
                        return;
                    }
                    model.configs(resp.sort());
                    if (_.isFunction(callback)) { callback(); }
                },
                function(xhr) { window.console.log("ERROR: There was a problem listing the configs"); }
            );
        };

        function fetchConfig(id, callback) {
            reqwest({
                url: common.config.apiBase + '/config/' + id,
                type: 'json'
            }).then(
                function(resp) {
                    if (_.isFunction(callback)) { callback(resp); }
                },
                function(xhr) { window.console.log("ERROR: There was a problem fetching the config for " + id); }
            );
        };

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
            setConfig(config ? [config] : []);
        });

        knockout.bindingHandlers.makeDropabble = {
            init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                element.addEventListener('dragover',  onDragOver,  false);
                element.addEventListener('drop',      onDrop,      false);
            }
        };

        knockout.bindingHandlers.sparkline = {
            update: function (element, valueAccessor, allBindingsAccessor, model) {
                var groups = knockout.utils.unwrapObservable(valueAccessor()),
                    max;

                if (!_.isArray(groups)) { return; };
                max = _.max(_.pluck(groups, 'max'));
                if (!max) { return; };

                _.each(_.toArray(groups).reverse(), function(group, i){
                    $(element).sparkline(group.data, {
                        chartRangeMax: max,
                        defaultPixelsPerValue: group.data.length < 50 ? group.data.length < 30 ? 3 : 2 : 1,
                        height: Math.round(Math.max(10, Math.min(40, max))),
                        lineColor: '#' + group.color,
                        spotColor: false,
                        minSpotColor: false,
                        maxSpotColor: false,
                        lineWidth: group.activity || 1,
                        fillColor: false,
                        composite: i > 0
                    });

                });
            }
        };

        this.init = function(callback) {
            fetchConfigs(function(){
                knockout.applyBindings(model);

                renderConfig();
                window.onpopstate = renderConfig;

                //startPoller();
                model.latestArticles.search();
                //model.latestArticles.startPoller();
            });
        };

    };

});
