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
    var configs = {},
        dragging = false,
        clipboardEl = document.querySelector('#clipboard'),
        listLoadsPending = 0,
        loc = window.location;

    return function(selector) {

        var model = {},
            self = this;

        function chosenCollections() {
            return [].concat(_.filter((common.util.queryParams().collections || "").split(","), function(str){ return !!str; }));
        }

        function dropCollection(list) {
            setDisplayedLists(_.reject(chosenCollections(), function(id){ return id === list.id; }));
        }

        function clearAll() {
            model.config(undefined);
            setDisplayedLists([]);
        }

        function setDisplayedLists(listIDs) {
            var qp = common.util.queryParams();
            qp.collections = listIDs.join(',');
            qp = _.pairs(qp)
                .filter(function(p){ return !!p[0]; })
                .map(function(p){ return p[0] + (p[1] ? '=' + p[1] : ''); })
                .join('&');

            history.pushState({}, "", loc.pathname + '?' + qp);
            renderLists();
        }

        function renderLists() {
            model.collections.removeAll();
            model.collections(
                chosenCollections().map(function(id){
                    return new List(id);
                })
            );
            connectSortableLists();
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
            var listId,
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
                    draft: true,
                    live: list.hasClass('is-live')
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

        function _startPoller() {
            setInterval(function(){
                model.collections().forEach(function(list){
                    if (!dragging) {
                        list.refresh();
                    }
                });
            }, 5000);
        }
        var startPoller = _.once(_startPoller);

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

                    resp.forEach(function(id){
                        fetchConfig(id, function(c){
                            configs[id] = c; 
                        })                        
                    });

                    if (_.isFunction(callback)) { callback(); }
                },
                function(xhr) { window.console.log("ERROR: There was a problem listing the configs"); }
            );
            //window.configs = configs;
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

        this.init = function(callback) {
            model.latestArticles  = new LatestArticles();
            model.clipboard        = knockout.observableArray();

            model.configs     = knockout.observableArray();
            model.config      = knockout.observable();
            model.collections = knockout.observableArray();

            model.actions = {
                dropCollection: dropCollection,
                clearAll: clearAll,
                flushClipboard: flushClipboard
            }

            model.config.subscribe(function(config) {
                if (!config) { return; }

                var section = config.split('/')[1]; // assumes ids are formed "edition/section/.."

                model.latestArticles.section(common.config.sectionSearches[section || 'default'] || section);

                setDisplayedLists(_.pluck(configs[config], 'id'));
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
                        max = _.max(_.pluck(groups, 'max'));

                    if (!max) { return };

                    _.chain(groups)
                    .sortBy(function(g){
                        // Put biggest groups first, so that its fill color is behind the other groups
                        return -1 * g.max;
                    }).each(function(group, i){
                        var data = group.data;

                        $(element).sparkline(data, {
                            chartRangeMax: max,
                            defaultPixelsPerValue: data.length < 50 ? data.length < 30 ? 3 : 2 : 1,
                            height: Math.max(10, Math.min(30, max)),
                            lineColor: '#' + group.color,
                            fillColor: _.last(data) > 25 ? '#eeeeee' : false,
                            spotColor: false,
                            minSpotColor: false,
                            maxSpotColor: false,
                            lineWidth: _.last(data) > 25 ? 2 : 1,
                            composite: i > 0
                        });
                    });
                }
            };

            fetchConfigs(function(){
                knockout.applyBindings(model);

                renderLists();

                window.onpopstate = renderLists;

                startPoller();
                model.latestArticles.search();
                //model.latestArticles.startPoller();
            });
        };

    };

});
