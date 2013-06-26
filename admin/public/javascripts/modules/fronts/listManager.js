define([
    'Reqwest',
    'Knockout',
    'models/fronts/latestArticles'
], function(
    reqwest,
    knockout,
    latestArticles
) {

    return function(selector) {

        var self = this,
            doc = document,
            viewModel = {
                list: knockout.observableArray(),
                latest: new latestArticles()
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
            if (!item) {
                return;
            }

            if (!$(fromList).hasClass('throwAway')) {
                lists.push(fromList);
            }

            if (!$(toList).hasClass('throwAway') && fromList !== toList) {
                lists.push(toList);
            }

            lists = lists.map(function(list){
                var inList = $("[data-url='" + item + "']", list),
                    delta = {
                        item: item,
                        verb: 'add'
                    };

                if (inList.length) {
                    delta.position = inList.next().data('url');
                    if(!delta.position) {
                        delta.after = true
                    } 
                } else {
                    delta.verb = 'remove';
                }
                console.log(JSON.stringify(delta));
            });
        };

        this.addItem = function(item) {
            if (!item) { return; }
            viewModel.list.push({
                url: item
            });
        };

        this.loadList = function(list) {
            if (!list || !list.length) { return; }
            viewModel.list.removeAll();
            list.forEach(function(item){
                self.addItem(item);
            });
        };

        this.init = function(callback) {

            viewModel.latest.search();

            /*
            reqwest({
                url: '/fronts/top-stories',
                type: 'json'
            }).then(
                function(resp) {
                    this.loadList(resp.articles);
                }
            );
            */
            // Load a dummy list instead
            this.loadList([
                "society/2013/jun/25/society-daily-email",
                "environment/2013/jun/25/obama-unveil-first-us-climate-strategy",
                "sport/2013/jun/25/lions-melbourne-rebels-live-report",
                "tv-and-radio/video/2013/jun/25/question-time-russell-brand-video-review",
                "sport/that-1980s-sports-blog/2013/jun/25/lions-battled-bollymore-test-australia-1989",
                "uk/2013/jun/25/ian-brady-tells-tribunal-not-psychotic",
                "business/2013/jun/25/eurozone-crisis-greece-reshuffle-cabinet",
                "politics/blog/2013/jun/25/mervyn-king-treasury-committee-live-blog",
                "business/2013/jun/24/eurozone-crisis-bond-yields-spain-greece",
                "global-development/2013/jun/25/central-american-farmers-coyotes"
            ]); 

            knockout.applyBindings(viewModel);

            connectSortableLists('.connectedSortable');
        };


    };

});
