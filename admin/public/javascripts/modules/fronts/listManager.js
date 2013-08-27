define([
    'Reqwest',
    'knockout',
    'models/fronts/common',
    'models/fronts/list',
    'models/fronts/article',
    'models/fronts/latestArticles',
    'models/fronts/contentApi',
    'models/fronts/ophanApi'
], function(
    reqwest,
    knockout,
    common,
    List,
    Article,
    LatestArticles,
    contentApi,
    ophanApi
) {
    var collections = {},
        sectionSearches,
        dragging = false,
        clipboardEl = document.querySelector('#clipboard'),
        listLoadsPending = 0,
        loc = window.location;

    return function(selector) {

        var model = {},
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

        function clearAll() {
            setDisplayedLists([]);
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

        function displayInAllEditions() {
            setDisplayedLists(model.editions().map(function(edition){
                return [edition, model.section(), model.block()].join('/'); 
            }));
        }

        function renderLists(opts) {
            var chosen = chosenLists(),
                first;

            opts = opts || {};

            model.listsDisplayed.remove(function(list){
                if (chosen.indexOf(list.id) === -1) {
                    return true;
                } else {
                    chosen = _.without(chosen, list.id);
                    return false;
                }    
            });

            chosen.forEach(function(id){
                model.listsDisplayed.push(new List(id));
            });

            if(opts.inferDefaults && chosen[0]) {
                first = chosen[0].split('/');
                model.edition(first.shift());
                model.section(first.shift());
            }

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
                    live: list.hasClass('is-live')
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
                model.listsDisplayed().forEach(function(list){
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
                    resp.collections.forEach(function(id){
                        treeAdd(id.split('/'), collections);
                    });                    
                    model.editions(_.keys(collections));

                    sectionSearches = resp.sectionSearches || {};

                    if (_.isFunction(callback)) { callback(); }
                },
                function(xhr) { alert("Oops. There was a problem loading the trailblock definitions file."); }
            );
        };

        function treeAdd(path, obj) {
            var f = _.first(path),
                r = _.rest(path);

            obj[f] = obj[f] || {};
            if (r.length) {
                treeAdd(r, obj[f]);
            }
        };

        function displaySelectedBlocks() {           
            var blocks = model.block() ? [model.block()] : model.blocks();

            blocks.forEach(function(block){
                addList([
                    model.edition(),
                    model.section(),
                    block
                ].join('/'));
            })
        };

        this.init = function(callback) {
            model.latestArticles  = new LatestArticles();
            model.listsDisplayed  = knockout.observableArray();
            model.clipboard        = knockout.observableArray();

            model.editions = knockout.observableArray();
            model.edition  = knockout.observable();

            model.sections = knockout.observableArray();
            model.section  = knockout.observable();

            model.blocks   = knockout.observableArray();
            model.block    = knockout.observable();

            model.actions = {
                displaySelectedBlocks: displaySelectedBlocks,
                displayInAllEditions: displayInAllEditions,
                dropList: dropList,
                clearAll: clearAll,
                flushClipboard: flushClipboard
            }

            model.edition.subscribe(function(edition) {
                model.sections.removeAll();
                if (common.util.hasNestedProperty(collections, edition)) {
                    model.sections(_.keys(collections[edition]));
                }
                model.section(undefined);

                model.blocks.removeAll();
                model.block(undefined);
            });

            model.section.subscribe(function(section) {
                model.blocks.removeAll();
                if (common.util.hasNestedProperty(collections, model.edition(), section)) {
                    model.blocks(_.keys(collections[model.edition()][section]));
                }
                model.block(undefined);

                if (section) {
                    model.latestArticles.section(sectionSearches[section] || section);
                }
            });

            function flushClipboard() {
                model.clipboard.removeAll();
                clipboardEl.innerHTML = '';
            };

            function onDragOver(event) {
                event.preventDefault();
            }

            function onDrop(event) {
                var url = event.testData ? event.testData : event.dataTransfer.getData('Text');

                if(!url) { return true; }

                event.preventDefault();

                if (common.util.urlHost(url).indexOf('google') > -1) {
                    url = decodeURIComponent(common.util.parseQueryParams(url).url);
                };

                model.clipboard.unshift(new Article({
                    id: common.util.urlAbsPath(url)
                }));

                contentApi.decorateItems(model.clipboard());
                ophanApi.decorateItems(model.clipboard());
            }

            knockout.bindingHandlers.makeDropabble = {
                init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    element.addEventListener('dragover',  onDragOver,  false);
                    element.addEventListener('drop',      onDrop,      false);
                }
            };

            knockout.bindingHandlers.sparkline = {
                update: function (element, valueAccessor, allBindingsAccessor, model) {
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

            fetchSchema(function(){
                knockout.applyBindings(model);

                renderLists({inferDefaults: true});

                window.onpopstate = renderLists;

                startPoller();
                model.latestArticles.search();
                model.latestArticles.startPoller();
            });

        };

    };

});
