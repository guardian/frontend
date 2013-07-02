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
            var list = knockout.observableArray();

            reqwest({
                url: '/frontsapi/list/' + listName,
                type: 'json'
            }).then(
                function(resp) {
                    console.log(resp);
                    self.loadList(list, resp[list]); 
                    viewModel.listsDisplayed.unshift({
                        name: listName,
                        list: list
                    });
                    connectSortableLists();
                },
                function(xhr) { console.log(xhr); } // error
            );
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
                    // error
                    function(xhr) {
                        console.log(xhr);
                    }
                );
            });
        };

        this.addItem = function(list, item) {
            if (!item || !list) { return; }
            list.push(new Article({
                id: item
            }));
        };

        this.loadList = function(list, items) {
            if (!items || !items.length || !list) { return; }
            list.removeAll();
            items.forEach(function(item){
                self.addItem(list, item);
            });
            ContentApi.decorateItems(list());
        };

        this.loadListIDs = function() {
            reqwest({
                url: '/frontsapi/lists',
                type: 'json'
            }).then(
                function(resp) {
                    if (resp.lists) {
                        viewModel.listsAvailable(resp.lists);
                    }
                },
                function(xhr) { console.log(xhr); } // error
            );
        };

        this.init = function(callback) {
            var that = this;

            viewModel.latestArticles.search();

            knockout.applyBindings(viewModel);

            connectSortableLists();

            this.loadListIDs();
        };


    };

});
