define([
    'knockout',
    'models/common',
    'models/authedAjax',
    'models/article',
    'models/contentApi',
    'models/ophanApi'
], function(
    ko,
    common,
    authedAjax,
    Article,
    contentApi,
    ophanApi
) {
    var fromList;

    function init() {
        ko.bindingHandlers.makeDropabble = {
            init: function(element) {

                element.addEventListener('dragstart', function(event){
                    fromList = ko.dataFor(element);
                }, false);

                element.addEventListener('dragover', function(event){
                    var targetList = ko.dataFor(element),
                        targetItem = ko.dataFor(event.target);

                    event.preventDefault();

                    targetList.underDrag(targetItem.constructor !== Article);
                    _.each(targetList.articles(), function(item) {
                        var underDrag = (item === targetItem);
                        if (underDrag !== item.state.underDrag()) {
                            item.state.underDrag(underDrag);
                        }
                    });
                }, false);

                element.addEventListener('dragleave', function(event){
                    var targetList = ko.dataFor(element);

                    event.preventDefault();

                    targetList.underDrag(false);
                    _.each(targetList.articles(), function(item) {
                        if (item.state.underDrag()) {
                            item.state.underDrag(false);
                        }
                    });
                }, false);

                element.addEventListener('drop', function(event){
                    var targetList = ko.dataFor(element),
                        targetItem = ko.dataFor(event.target),
                        item = event.testData ? event.testData : event.dataTransfer.getData('Text'),
                        position,
                        offset = 0,
                        insertAt;

                    event.preventDefault();

                    targetList.underDrag(false);
                    _.each(targetList.articles(), function(item) {
                        item.state.underDrag(false);
                    });

                    if (targetItem.constructor !== Article) {
                        targetItem = _.last(targetList.articles ? targetList.articles() : undefined);
                        offset  = 0 + !!targetItem;
                    }

                    position = targetItem && targetItem.meta ? targetItem.meta.id() : undefined;

                    if (common.util.urlHost(item).indexOf('google') > -1) {
                        item = decodeURIComponent(common.util.parseQueryParams(item).url);
                    }

                    item = common.util.urlAbsPath(item);

                    if (item === position) { // adding an item next to itself
                        return;
                    }

                    // for display only:
                    if (targetList.articles) {
                        insertAt = targetList.articles().indexOf(targetItem) + offset;
                        insertAt = insertAt === -1 ? targetList.articles().length : insertAt;
                        targetList.articles.splice(insertAt, 0, new Article({id: item}))

                        contentApi.decorateItems(targetList.articles());
                        ophanApi.decorateItems(targetList.articles());
                    }

                    if (!targetList.collection) { // this is a non-collection list, e.g. a clipboard
                        return;
                    }

                    saveChanges(
                        'post',
                        targetList.collection,
                        {
                            item:     item,
                            position: position,
                            after:    offset > 0 ? true : undefined,
                            live:     targetList.collection.state.liveMode(),
                            draft:   !targetList.collection.state.liveMode(),
                            itemMeta: {
                                group: targetList.group
                            }
                        }
                    )

                    if (!fromList || fromList.keepCopy || fromList === targetList) {
                        return;
                    }

                    // for display only:
                    fromList.articles.remove(function(article) {
                        return article.meta.id() === item;
                    })

                    saveChanges(
                        'delete',
                        fromList.collection,
                        {
                            item:   item,
                            live:   fromList.collection.state.liveMode(),
                            draft: !fromList.collection.state.liveMode()
                        }
                    )
                }, false);
            }
        };
    };

    function saveChanges(method, collection, data) {
        collection.state.loadIsPending(true);
        authedAjax({
            url: common.config.apiBase + '/collection/' + collection.id,
            type: method,
            data: JSON.stringify(data)
        }).then(function() {
            collection.load();
        });
    };

    return {
        init: init
    };
});
