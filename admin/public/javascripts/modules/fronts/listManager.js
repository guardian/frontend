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
    var maxDisplayedLists = 3;

    return function(selector) {

        var self = this,
            viewModel = {
                latestArticles: new LatestArticles(),
                listsDisplayed: knockout.observableArray(),
                listsAvailable: knockout.observableArray(),
                newListName:    knockout.observable()
            };

        viewModel.displayList = function(item) {
            reqwest({
                url: '/frontsapi/list/' + item.name,
                type: 'json'
            }).then(
                function(resp) {
                    viewModel.hideList(item);
                    populateList(item.list, resp.list);
                    viewModel.listsDisplayed.unshift(item);
                    limitListsDisplayed(maxDisplayedLists);
                    connectSortableLists();
                },
                function(xhr) { console.log(xhr); } // error
            );
        }

        viewModel.hideList = function(list) {
            viewModel.listsDisplayed.remove(list);
        }

        viewModel.createList = function() {
            var name = viewModel.newListName(),
                alreadyAvailable = !!withKeyValue(viewModel.listsAvailable(), 'name', name).length;

            if (!alreadyAvailable) {
                viewModel.displayList(newAvailableList(name));
                viewModel.newListName('');
            }
        }

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
                var inList = $("[data-url='" + item + "']", list),
                    delta = {
                        list: list.id,
                        item: item,
                        verb: 'add'
                    };

                if (inList.length) {
                    delta.position = inList.next().data('url') || '';
                    // if this is adding after the last item
                    var numOfItems = $("[data-url]", list).length;
                    if (!delta.position && numOfItems > 1) {
                        delta.after = true;
                        delta.position = $("[data-url]", list).eq(numOfItems - 2).data('url');
                    } 
                } else {
                    delta.verb = 'remove';
                }
                reqwest({
                    url: '/frontsapi/listitem/' + delta.list,
                    contentType: 'application/json',
                    type: 'json',
                    method: 'post',
                    data: JSON.stringify(delta)
                }).then(
                    function(resp) { },
                    function(xhr) { console.log(xhr); } // error
                );
            });
        };

        function addItem(list, item) {
            if (!item || !list) { return; }
            list.push(new Article({
                id: item
            }));
        };

        function populateList(list, items) {
            if (!items || !items.length || !list) { return; }
            list.removeAll();
            items.forEach(function(item){
                addItem(list, item);
            });
            ContentApi.decorateItems(list());
        };

        function newAvailableList(name) {
            var item = {
                name: name,
                list: knockout.observableArray()
            }

            viewModel.listsAvailable.push(item);
            return item;
        }

        function fetchAvailableLists() {
            reqwest({
                url: '/frontsapi/lists',
                type: 'json'
            }).then(
                function(resp) {
                    []
                    .concat(resp.lists)
                    .sort(function (a, b) {return a > b ? 1 : -1;})
                    .map(function(name, index){
                        var list = newAvailableList(name);
                        if (index <= maxDisplayedLists) {
                            viewModel.displayList(list);
                        }
                    });
                },
                function(xhr) { console.log(xhr); } // error
            );
        };

        this.init = function(callback) {
            viewModel.latestArticles.search();
            fetchAvailableLists();
            connectSortableLists();
            knockout.applyBindings(viewModel);
        };

    };

});
