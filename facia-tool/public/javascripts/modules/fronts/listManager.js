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
                fromListObj,
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
                    fromListObj = knockout.dataFor(fromList[0]);
                },
                stop: function(event, ui) {
                    var index,
                        clone;

                    common.state.uiBusy = false;

                    // If we move between lists, effect a copy by cloning
                    if(toList !== fromList) {
                        index = toList.children().index(item);
                        clone = $(ui.item[0]).clone(true).removeClass('box ui-draggable ui-draggable-dragging').addClass('box-clone');
                        toList.children(':eq(' + index + ')').after(clone);
                        // So that the original stays in place:
                        $(this).sortable('cancel');
                    }

                    saveListDelta(item.data('url'), toList);
                },
                change: function(event, ui) {
                    if(ui.sender) toList = ui.placeholder.parent();
                },
                connectWith: selector
            }).disableSelection();
        };

        function saveListDelta(id, list) {
            var isLive = list.hasClass('is-live'),
                listId,
                inList,
                listObj,
                position,
                delta;

            if (!list.hasClass('persisted')) { return; }

            listObj = knockout.dataFor(list[0]);

            listId = list.attr('data-list-id');
            if (!listId) { return; }

            inList = $("[data-url='" + id + "']", list);

            if (inList.length) {
                delta = {
                    item: id,
                    live:   isLive,
                    draft: !isLive
                };

                position = inList.next().data('url');
                if (position) {
                    delta.position = position;
                } else {
                    var numOfItems = $("[data-url]", list).length;
                    if (numOfItems > 1) {
                        delta.position = $("[data-url]", list).eq(numOfItems - 2).data('url');
                        delta.after = true;
                    }
                }

                listObj.state.loadIsPending(true);

                reqwest({
                    method: 'post',
                    url: common.config.apiBase + '/collection/' + listId,
                    type: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(delta)
                }).always(function(resp) {
                    listObj.load();
                });
            }
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

                startPoller();
                model.latestArticles.search();
                model.latestArticles.startPoller();
            });
        };

    };

});
