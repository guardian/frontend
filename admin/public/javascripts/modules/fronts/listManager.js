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

        var self = this,
            viewModel = {
                latestArticles: new LatestArticles(),
                listsDisplayed: knockout.observableArray(),

                selectedEdition : knockout.observable(),
                selectedSection : knockout.observable(),
                selectedBlock   : knockout.observable()
            };

        function displayList(id) {
            reqwest({
                url: apiBase + id,
                type: 'json'
            }).then(
                function(resp) {
                    addList(id, resp.trails)
                },
                function(xhr) {
                    if(xhr.status === 404) {
                        addList(id, [])
                    }
                }
            );
        }

        function addList(id, articles) {
            var list = knockout.observableArray();
            [].concat(articles).forEach(function(item){
                list.push(new Article({
                    id: item.id
                }));
            });
            dropList(id);
            viewModel.listsDisplayed.unshift({
                id: id,
                list: list
            });
            limitListsDisplayed(maxDisplayedLists);
            ContentApi.decorateItems(list());
            connectSortableLists();
        }

        function dropList(id) {
            id = id.id || id;
            viewModel.listsDisplayed.remove(function(item) {
                return item.id === id;
            })
        }
        viewModel.dropList = dropList;

        function limitListsDisplayed(max) {
            if(viewModel.listsDisplayed().length > max) {
                viewModel.listsDisplayed.pop();
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
                },
                stop: function(event, ui) {
                    saveListDeltas(
                        item[0],
                        fromList[0],
                        toList[0]
                    );
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
                    endpoint,
                    method,
                    delta;

                if (!listId) { return; }

                inList = $("[data-url='" + item + "']", list);

                if (inList.length) {
                    method = 'post',
                    endpoint = apiBase + listId;
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

                } else {
                    method = 'delete';
                    endpoint = apiBase + listId + '/' + item 
                }

                reqwest({
                    url: endpoint,
                    contentType: 'application/json',
                    type: 'json',
                    method: method,
                    data: JSON.stringify(delta)
                }).then(
                    function(resp) { },
                    function(xhr) { console.log(xhr); } // error
                );
            });
        };

        viewModel.selectedBlock.subscribe(function(block) {
            if(block && block.id) {
                var id = '/' + viewModel.selectedEdition().id +
                         '/' + viewModel.selectedSection().id +
                         '/' + block.id

                displayList(id);
            }
        });

        function fetchAvailableLists() {
            reqwest({
                url: apiBase,
                type: 'json'
            }).then(
                function(resp) {
                    viewModel.editions = resp.editions;
                    knockout.applyBindings(viewModel);
                    connectSortableLists();
                },
                function(xhr) { console.log(xhr); } // error
            );
        };

        this.init = function(callback) {
            viewModel.latestArticles.search();
            fetchAvailableLists();
        };

    };

});
