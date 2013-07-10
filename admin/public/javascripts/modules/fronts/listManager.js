define([
    'Reqwest',
    'knockout',
    'models/fronts/article',
    'models/fronts/latestArticles',
    'models/fronts/contentApi'
], function(
    reqwest,
    knockout,
    Article,
    LatestArticles,
    ContentApi
) {
    var apiBase = '/fronts/api',
        maxDisplayedLists = 3;

    return function(selector) {

        var viewModel = {},
            poller,
            self = this,
            draggedElem;

        function loadList(id, callback) {
            reqwest({
                url: apiBase + '/' + id,
                type: 'json'
            }).then(
                function(resp) {
                    callback(id, resp.trails)
                },
                function(xhr) {
                    if(xhr.status === 404) {
                        callback(id, [])
                    }
                }
            );
        }

        function addList(id, articles) {
            var list = knockout.observableArray();
            hydrateList(list, articles);
            dropList(id);
            viewModel.listsDisplayed.push({
                id: id,
                crumbs: id.split(/\//g),
                list: list
            });
            limitListsDisplayed(maxDisplayedLists);
            connectSortableLists();
            startPoller();
        }

        function hydrateList(list, articles) {
            list.removeAll();
            articles.forEach(function(item){
                list.push(new Article({
                    id: item.id
                }));
            });
            ContentApi.decorateItems(list());
        }

        function dropList(id) {
            id = id.id || id;
            viewModel.listsDisplayed.remove(function(item) {
                return item.id === id;
            })
        }

        function limitListsDisplayed(max) {
            if(viewModel.listsDisplayed().length > max) {
                viewModel.listsDisplayed.shift();
                limitListsDisplayed(max);
            }
        }

        function withKeyValue(arr, prop, val) {
            return arr.filter(function(obj){
                return obj[prop] === val;
            });
        }        

        function connectSortableLists() {
            var selector = '.connectedList',
                item,
                fromList,
                toList;

            $(selector).sortable({
                start: function(event, ui) {
                    item = ui.item;
                    toList = fromList = ui.item.parent();
                    stopPoller();
                },
                stop: function(event, ui) {
                    draggedElem = item[0];
                    saveListDeltas(
                        item[0],
                        fromList[0],
                        toList[0]
                    );
                    startPoller();
                },
                change: function(event, ui) {
                    if(ui.sender) toList = ui.placeholder.parent();
                },
                connectWith: selector
            }).disableSelection();
        };

        function saveListDeltas(item, fromList, toList) {
            var lists = [];
                    
            item = $(item).data('url');

            if (!item || !fromList || !toList) {
                return;
            }

            if (!$(fromList).hasClass('throwAway')) {
                lists.push(fromList);
            }

            if (!$(toList).hasClass('throwAway') && fromList !== toList) {
                lists.push(toList);
            }

            lists.map(function(list){
                var listId = $(list).attr('data-list-id'),
                    inList,
                    position,
                    delta,
                    opts;

                if (!listId) { return; }

                inList = $("[data-url='" + item + "']", list);

                if (inList.length) {
                    delta = {
                        item: item
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

                    opts = {
                        method: 'post',
                        url: apiBase + '/' + listId,
                        type: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify(delta)
                    };

                } else {
                    opts = {
                        method: 'delete',
                        url: apiBase + '/' + listId + '/' + item,
                    };
                }

                reqwest(opts).then(
                    function(resp) { },
                    function(xhr) { console.log(xhr); } // error
                );
            });
        };

        function startPoller() {
            stopPoller();
            poller = setInterval(function(){
                viewModel.listsDisplayed().forEach(function(list){
                    loadList(list.id, function(id, articles) {
                        if (poller) {
                            hydrateList(list.list, articles);

                            // A hack. Knockout doesn't flush the elements dragged into
                            // a container when it regenerates the DOM content of that container 
                            if (draggedElem) {
                                $(draggedElem).remove();
                                draggedElem = false;
                            }
                        }
                    });
                });
            }, 2000);
        }

        function stopPoller() {
            clearInterval(poller);
            poller = false;
        }

        function fetchSchema() {
            reqwest({
                url: apiBase,
                type: 'json'
            }).then(
                function(resp) {
                    viewModel.editions = resp.editions;                    
                    // Render the page
                    knockout.applyBindings(viewModel);
                    connectSortableLists();
                },
                function(xhr) { console.log(xhr); } // error
            );
        };

        this.init = function(callback) {

            viewModel.latestArticles  = new LatestArticles();
            viewModel.listsDisplayed  = knockout.observableArray();

            viewModel.selectedEdition = knockout.observable();
            viewModel.selectedSection = knockout.observable();
            viewModel.selectedBlock   = knockout.observable();
            viewModel.dropList        = dropList;

            fetchSchema();

            viewModel.selectedBlock.subscribe(function(block) {
                if(block && block.id) {
                    var id = viewModel.selectedEdition().id + '/' +
                             viewModel.selectedSection().id + '/' + 
                             block.id;

                    loadList(id, addList);
                }
            });

            viewModel.latestArticles.search();
        };

    };

});
