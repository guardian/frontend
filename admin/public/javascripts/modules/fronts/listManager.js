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

    return function(selector) {

        var self = this,
            viewModel = {
                latestArticles: new LatestArticles(),
                listsDisplayed: knockout.observableArray(),
                listsAvailable: knockout.observableArray(),
                newListName:    knockout.observable()
            };

        viewModel.displayList = function(listName) {
            var list = knockout.observableArray(),
                listLen = viewModel.listsDisplayed().length;

            viewModel.hideList(listName);

            // Do no more if we've just removed the list (i.e. toggled it off)
            if (listLen !== viewModel.listsDisplayed().length) { return; };

            // Load the list
            reqwest({
                url: '/frontsapi/list/' + listName,
                type: 'json'
            }).then(
                function(resp) {
                    populateList(list, resp.list); 
                    viewModel.listsDisplayed.unshift({
                        name: listName,
                        list: list
                    });
                    connectSortableLists();
                },
                function(xhr) { console.log(xhr); } // error
            );
        }

        viewModel.hideList = function(list) {
            var name = (typeof list === 'string' ? list : list.name);
            viewModel.listsDisplayed.remove(function(item){
                return item.name === name;
            });
        }

        viewModel.createList = function() {
            var listName = viewModel.newListName();

            if (viewModel.listsAvailable().indexOf(listName) === -1) {
                viewModel.listsAvailable.push(listName);
                viewModel.displayList(listName);
                viewModel.newListName('');
            }
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

        function fetchAvailableLists() {
            reqwest({
                url: '/frontsapi/lists',
                type: 'json'
            }).then(
                function(resp) {
                    viewModel.listsAvailable(resp.lists);
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
