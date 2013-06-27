define([
    'Reqwest',
    'Knockout',
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

            viewModel.latest.search();

            // Load dummy lists
            this.loadList(viewModel.listA, [
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
            this.loadList(viewModel.listB, [
                "news/2013/jun/27/glastonbury-mandela-obama-robson-wimbledon-news-photographs",
                "uk/2013/jun/27/doreen-lawrence-met-chief-police",
                "money/blog/2013/jun/27/payday-loans-industry-law-unto-itself",
                "business/2013/jun/27/eurozone-crisis-bank-bailout-rules-summit",
                "business/2013/jun/27/rural-broadband-target-postponed",
                "housing-network/2013/jun/27/direct-payment-guarantee-landlords",
                "commentisfree/2013/jun/27/supreme-court-gay-marriage-battle-almost-done",
                "sport/picture/2013/jun/27/sport-picture-of-the-day-horsing-around",
                "world/2013/jun/27/uk-road-deaths",
                "world/2013/jun/27/turkey-protests-hundreds-barricades-ankara"
            ]); 

            knockout.applyBindings(viewModel);

            connectSortableLists('.connectedList');
        };


    };

});
