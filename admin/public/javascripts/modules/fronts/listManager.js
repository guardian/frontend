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
            self = this;

        function loadList(id, callback) {
            reqwest({
                url: apiBase + '/' + id,
                type: 'json'
            }).then(
                function(resp) {
                    callback(id, resp.trails, resp.lastUpdated, resp.updatedBy, resp.updatedEmail)
                },
                function(xhr) {
                    if(xhr.status === 404) {
                        callback(id, [])
                    }
                }
            );
        }

        function addList(id, articles, lastUpdated, updatedBy, updatedEmail) {
            var list = knockout.observableArray();
            hydrateList(list, articles);
            dropList(id);
            viewModel.listsDisplayed.unshift({
                id: id,
                crumbs: id.split(/\//g),
                list: list,
                lastUpdated: knockout.observable(timeAgoString(lastUpdated)),
                updatedBy: knockout.observable(updatedBy),
                updatedEmail: knockout.observable(updatedEmail)
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
                helper: 'clone',
                start: function(event, ui) {
                    ui.placeholder.height(ui.item.height());
                    item = ui.item;
                    toList = fromList = item.parent();
                    stopPoller();
                },
                stop: function(event, ui) {
                    var idx,
                        elm;

                    if(toList !== fromList) {
                        idx = toList.children().index(item);
                        elm = $(ui.item[0]).clone(true).removeClass('box ui-draggable ui-draggable-dragging').addClass('box-clone');

                        toList.children(':eq(' + idx + ')').after(elm);
                        $(this).sortable('cancel');
                    }

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

            /*
            if (!$(fromList).hasClass('throwAway')) {
                lists.push(fromList);
            }

            if (!$(toList).hasClass('throwAway') && fromList !== toList) {
                lists.push(toList);
            }
            */

            if (!$(toList).hasClass('throwAway')) {
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

        function timeAgoString(date) {
            return date ? humanized_time_span(date) : '';
        }

        function startPoller() {
            stopPoller();
            poller = setInterval(function(){
                viewModel.listsDisplayed().forEach(function(list){
                    loadList(list.id, function(id, articles, lastUpdated, updatedBy, updatedEmail) {
                        if (poller) {
                            // Knockout doesn't seem to empty elements dragged into
                            // a container when it regenerates its DOM content. So empty it first.
                            list.containerEl = list.containerEl || $('[data-list-id="' + list.id + '"]');
                            list.containerEl.empty();

                            hydrateList(list.list, articles);
                            list.lastUpdated(timeAgoString(lastUpdated));
                            list.updatedBy(updatedBy),
                            list.updatedEmail(updatedEmail)
                        }
                    });
                });
            }, 3000);
        }

        function stopPoller() {
            clearInterval(poller);
            poller = false;
        }

        function displayAllEditions() {
            viewModel.editions.forEach(function(edition){
                if (edition.id !== viewModel.selectedEdition().id) {
                    var id = edition.id + '/' +
                        viewModel.selectedSection().id + '/' + 
                        viewModel.selectedBlock().id; 

                    loadList(id, addList);
                }
            });
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

            viewModel.dropList           = dropList;
            viewModel.displayAllEditions = displayAllEditions;

            fetchSchema();

            // Whenever a block is selected, load its list 
            viewModel.selectedBlock.subscribe(function(block) {
                if(block && block.id) {
                    var id = viewModel.selectedEdition().id + '/' +
                             viewModel.selectedSection().id + '/' + 
                             block.id;

                    loadList(id, addList);
                }
            });

            // Whenever a section is selected, update the search
            viewModel.selectedSection.subscribe(function(section) {
                viewModel.latestArticles.section(section.id);
            });

            viewModel.latestArticles.search();
        };

    };

});
