define([
    'Reqwest',
    'knockout',
    'models/fronts/globals',
    'models/fronts/list',
    'models/fronts/article',
    'models/fronts/latestArticles'
], function(
    reqwest,
    knockout,
    globals,
    List,
    Article,
    LatestArticles
) {
    var apiBase = '/fronts/api',
        maxDisplayedLists = 3,
        dragging = false;

    return function(selector) {

        var viewModel = {},
            schemaLookUp = {},
            self = this;

        function getHashLists() {
            return window.location.hash ? window.location.hash.slice(1).split(",") : [];
        }

        function renderLists() {
            viewModel.listsDisplayed.removeAll();
            getHashLists().forEach(function(id){
                viewModel.listsDisplayed.push(new List(id, schemaLookUp[id]));
            });
            connectSortableLists();
        }

        function addList(id) {
            var ids = getHashLists().slice(1 - maxDisplayedLists);
            if(ids.indexOf(id) === -1) {
                ids.push(id);
                window.location.hash = ids.join(',');
            }
        }

        function displayAllEditions() {
            window.location.hash = viewModel.editions.map(function(edition){
                return edition.id + '/' + viewModel.selectedSection().id + '/' + viewModel.selectedBlock().id; 
            }).join(',');
        }

        function dropList(list) {
            var ids = getHashLists(),
                id = list.id || list,
                pos = ids.indexOf(id);

            if (pos > -1) {
                ids.splice(pos, 1);
                window.location.hash = ids.join(',');
            }
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
                    globals.uiBusy = true;

                    // Display the source item. (The clone gets dragged.) 
                    sortables.find('.trail:hidden').show();

                    item = ui.item;
                    toList = fromList = item.parent();
                    fromListObj = knockout.dataFor(fromList[0]);
                    
                },
                stop: function(event, ui) {
                    var index,
                        clone;

                    globals.uiBusy = false;

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

                listObj.loadIsPending(true);
            }
        };

        function startPoller() {
            setInterval(function(){
                viewModel.listsDisplayed().forEach(function(list){
                    if (!dragging) {
                        list.refresh();
                    }
                });
            }, 5000);
        }

        function fetchSchema(callback) {
            reqwest({
                url: apiBase,
                type: 'json'
            }).then(
                function(resp) {
                    // Make a flat version of schema for lookup by id path, e.g. "uk/news/top-stories" 
                    [].concat(resp.editions).forEach(function(edition){
                        [].concat(edition.sections).forEach(function(section){
                            [].concat(section.blocks).forEach(function(block){
                                schemaLookUp[edition.id + '/' + section.id + '/' + block.id] = block;
                            });
                        });
                    });

                    viewModel.editions = resp.editions;
                    if (typeof callback === 'function') { callback(); }
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

            viewModel.selectedEdition.subscribe(function(edition) {
                viewModel.selectedSection(undefined);
                viewModel.selectedBlock(undefined);
            });

            viewModel.selectedSection.subscribe(function(section) {
                viewModel.selectedBlock(undefined);
                if (section && section.id) {
                    viewModel.latestArticles.section(section.sectionSearch || section.id);
                }
            });

            viewModel.selectedBlock.subscribe(function(block) {
                var id;
                if(block && block.id) {
                    id = viewModel.selectedEdition().id + '/' +
                         viewModel.selectedSection().id + '/' + 
                         block.id;

                    addList(id);
                }
            });

            fetchSchema(function(){
                knockout.applyBindings(viewModel);

                renderLists();
                window.onhashchange = renderLists;

                startPoller();
                viewModel.latestArticles.search();
                viewModel.latestArticles.startPoller();
            });
        };

    };

});
