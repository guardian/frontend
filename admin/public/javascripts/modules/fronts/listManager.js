define([
    'Reqwest',
    'knockout',
    'models/fronts/common',
    'models/fronts/list',
    'models/fronts/article',
    'models/fronts/latestArticles'
], function(
    reqwest,
    knockout,
    common,
    List,
    Article,
    LatestArticles
) {
    var dragging = false,
        clipboard = document.querySelector('#clipboard'),
        listLoadsPending = 0,
        loc = window.location;

    return function(selector) {

        var viewModel = {},
            self = this;

        function chosenLists() {
            return [].concat(_.filter((common.util.queryParams().blocks || "").split(","), function(str){ return !!str; }));
        }

        function addList(id) {
            var lists = chosenLists();
            lists = _.without(lists, id);
            lists.unshift(id);
            lists = _.first(lists, common.config.maxDisplayableLists || 3);
            setDisplayedLists(lists);
        }

        function dropList(list) {
            setDisplayedLists(_.reject(chosenLists(), function(id){ return id === list.id; }));
            common.util.pageReflow();
        }

        function setDisplayedLists(listIDs) {
            var qp = common.util.queryParams();
            qp.blocks = listIDs.join(',');
            qp = _.pairs(qp)
                .filter(function(p){ return !!p[0]; })
                .map(function(p){ return p[0] + (p[1] ? '=' + p[1] : ''); })
                .join('&');

            history.pushState({}, "", loc.pathname + '?' + qp);
            renderLists();
        }

        function displayAllEditions() {
            setDisplayedLists(viewModel.editions.map(function(edition){
                return edition.id + '/' + viewModel.selectedSection().id + '/' + viewModel.selectedBlock().id; 
            }));
        }

        function renderLists() {
            var chosen = chosenLists();
            //viewModel.listsDisplayed.removeAll();
            viewModel.listsDisplayed.remove(function(list){
                if (chosen.indexOf(list.id) === -1) {
                    return true;
                } else {
                    chosen = _.without(chosen, list.id);
                    return false;
                }    
            });

            chosen.reverse().forEach(function(id){
                viewModel.listsDisplayed.unshift(new List(id));
            });
            connectSortableLists();
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
                opacity: 0.9,
                revert: 200,
                scroll: true,
                start: function(event, ui) {
                    common.state.uiBusy = true;

                    // Display the source item. (The clone gets dragged.) 
                    sortables.find('.trail:hidden').show();

                    item = ui.item;
                    toList = fromList = item.parent();
                    fromListObj = knockout.dataFor(fromList[0]);                    
                },
                stop: function(event, ui) {
                    var index,
                        clone;

                    common.state.uiBusy = false;

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

            if (!list.hasClass('persisted')) { return; }

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

                listObj.state.loadIsPending(true);

                reqwest({
                    method: 'post',
                    url: common.config.apiBase + '/' + listId,
                    type: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(delta)
                }).always(function(resp) {
                    listObj.load();
                });
            }
        };

        function _startPoller() {
            setInterval(function(){
                viewModel.listsDisplayed().forEach(function(list){
                    if (!dragging) {
                        list.refresh();
                    }
                });
            }, 5000);
        }
        var startPoller = _.once(_startPoller);

        function fetchSchema(callback) {
            reqwest({
                url: common.config.apiBase,
                type: 'json'
            }).then(
                function(resp) {
                    viewModel.editions = resp.editions;
                    if (typeof callback === 'function') { callback(); }
                },
                function(xhr) { alert("Oops. There was a problem loading the trailblock definitions file."); }
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

            viewModel.flushClipboard = function() {
                clipboard.innerHTML = '';
            };

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
                window.onpopstate = renderLists;

                startPoller();
                viewModel.latestArticles.search();
                viewModel.latestArticles.startPoller();
            });


            knockout.bindingHandlers.sparkline = {
                update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                    var value = knockout.utils.unwrapObservable(valueAccessor()),
                        height = Math.max(15, Math.min(30, _.max(value))),
                        options = allBindingsAccessor().sparklineOptions || {
                            lineColor: '#d61d00',
                            fillColor: '#ffbaaf',
                            height: height
                        };

                    if( value && _.max(value)) {
                        $(element).sparkline(value, options);                        
                    }
                }
            };

            common.util.mediator.on('list:load:start', function() {
                listLoadsPending += 1;
            });

            common.util.mediator.on('list:load:end', function() {
                listLoadsPending -= 1;
                if (listLoadsPending < 1) {
                    listLoadsPending = 0;
                    common.util.pageReflow();
                }
            });

        };

    };

});
