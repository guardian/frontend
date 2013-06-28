define([
    'Reqwest',
    'knockout',
    'models/fronts/article',
    'models/fronts/latestArticles'
], function(
    reqwest,
    knockout,
    Article,
    LatestArticles
) {

    return function(selector) {

        var self = this,
            viewModel = {
                listA: knockout.observableArray(),
                listB: knockout.observableArray(),
                latest: new LatestArticles()
            };

        function connectSortableLists(selector) {
            var item,
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
                    // if there is a list and this is the last item
                    var numOfItems = $("[data-url]", list).length;
                    if (!delta.position && numOfItems > 1) {
                        delta.after = true;
                        console.log($("[data-url]", list));
                        delta.position = $("[data-url]", list).eq(numOfItems - 2).data('url');
                    } 
                } else {
                    delta.verb = 'remove';
                }
                console.log(JSON.stringify(delta));
                reqwest({
                    url: '/frontsapi/listitem/' + delta.list,
                    contentType: 'application/json',
                    type: 'json',
                    method: 'post',
                    data: JSON.stringify(delta)
                }).then(
                    function(resp) {
                        console.log(resp);
                    },
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
        };

        this.init = function(callback) {
            var that = this;

            viewModel.latest.search();

            // Load dummy lists
            ['listA', 'listB'].forEach(function(list) {
                reqwest({
                    url: '/frontsapi/list/' + list,
                    type: 'json'
                }).then(
                    function(resp) {
                        that.loadList(viewModel[list], resp[list]); 
                    },
                    // error
                    function(xhr) {
                        console.log(xhr);
                    }
                );
            })

            knockout.applyBindings(viewModel);

            connectSortableLists('.connectedList');
        };


    };

});
