define([
    'Reqwest',
    'knockout',
    'models/fronts/list',
    'models/fronts/article',
    'models/fronts/latestArticles'
], function(
    reqwest,
    knockout,
    List,
    Article,
    LatestArticles
) {
    var apiBase = '/fronts/api',
        maxDisplayedLists = 3,
        dragging = false,
        queryParams = (function(){
            var result = {};
            if (window.location.search) {
                var params = window.location.search.slice(1).split("&");
                for (var i = 0; i < params.length; i++) {
                    var tmp = params[i].split("=");
                    result[tmp[0]] = unescape(tmp[1]);
                }
            }
            return result;
        }());

    return function(selector) {

        var viewModel = {},
            self = this;

        function showList(id) {
            dropList(id);
            viewModel.listsDisplayed.push(new List(id));
            limitListsDisplayed(maxDisplayedLists);
            connectSortableLists();
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

        function connectSortableLists() {
            var selector = '.connectedList',
                sortables = $(selector),
                item,
                fromList,
                fromListObj,
                toList;

            sortables.sortable({
                helper: 'clone',
                revert: 200,
                scroll: true,
                start: function(event, ui) {
                    // Display the source trail. (The clone gets dragged.) 
                    sortables.find('.trail:hidden').show();

                    item = ui.item;
                    toList = fromList = item.parent();
                    fromListObj = knockout.dataFor(fromList[0]);

                    fromListObj.refreshable(false);
                },
                stop: function(event, ui) {
                    var index,
                        clone;

                    fromListObj.refreshable(true);

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
                
            if (list.hasClass('throwAway')) { return; }

            listObj = knockout.dataFor(list[0]);

            listId = list.attr('data-list-id');
            if (!listId) { return; }

            inList = $("[data-url='" + id + "']", list);

            if (inList.length) {
                delta = {
                    item: id,
                    draft: true,
                    live: !!list.attr('data-live-edit')
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

                reqwest({
                    method: 'post',
                    url: apiBase + '/' + listId,
                    type: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(delta)
                }).then(
                    function(resp) {
                        listObj.load();
                    },
                    function(xhr) { console.log(xhr); } // error
                );

                listObj.pending(true);
            }
        };

        function startPoller() {
            setInterval(function(){
                viewModel.listsDisplayed().forEach(function(list){
                    if (!dragging) {
                        list.refresh();
                    }
                });
            }, 1000);
        }

        function displayAllEditions() {
            viewModel.editions.forEach(function(edition){
                var id = edition.id + '/' +
                    viewModel.selectedSection().id + '/' + 
                    viewModel.selectedBlock().id; 

                showList(id);
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

            viewModel.selectedEdition.subscribe(function(edition) {
                viewModel.selectedSection('');
                viewModel.selectedBlock('');
            });

            viewModel.selectedSection.subscribe(function(section) {
                viewModel.selectedBlock('');
                if (section && section.id) {
                    viewModel.latestArticles.section(section.id);
                }
            });

            viewModel.selectedBlock.subscribe(function(block) {
                if(block && block.id) {
                    var id = viewModel.selectedEdition().id + '/' +
                             viewModel.selectedSection().id + '/' + 
                             block.id;

                    showList(id);
                }
            });

            if (queryParams.blocks) {
                queryParams.blocks.split(',').forEach(function(list){
                    showList(list);
                });
            }

            viewModel.latestArticles.search();

            startPoller();
        };

    };

});
