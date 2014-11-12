define([
    'test/utils/async-it',
    'test/utils/drag',
    'mock-collection',
    'test/utils/edit-actions',
    'test/utils/dom-nodes'
], function(
    it,
    drag,
    mockCollection,
    editAction,
    dom
){
    describe('Collections', function () {
        it('displays the correct timing', function (done) {
            expect(
                $('.list-header__timings').text().replace(/\s+/g, ' ')
            ).toMatch('1 day ago by Test');
            done();
        });

        it('adds items', function (done) {

            insertInEmptyGroup
            .then(function (request) {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.after).toEqual(false);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('sport');
                expect(request.data.update.item).toEqual('internal-code/content/1');
                expect(request.data.update.itemMeta.group).toEqual('3');

                return insertAfterAnArticle();
            }).then(function (request) {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.after).toEqual(true);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('latest');
                expect(request.data.update.item).toEqual('internal-code/content/2');
                expect(!!request.data.update.itemMeta).toEqual(false);
                expect(request.data.update.position).toEqual('internal-code/content/1');

                return insertOnTopOfTheList;
            }).then(function (request) {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.after).toEqual(false);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('latest');
                expect(request.data.update.item).toEqual('internal-code/content/3');
                expect(!!request.data.update.itemMeta).toEqual(false);
                expect(request.data.update.position).toEqual('internal-code/content/1');
            });

            function insertInEmptyGroup () {
                return editAction(function () {
                    var firstGroup = dom.droppableGroup(2, 1);
                    drag.droppable(firstGroup).drop(firstGroup, new drag.Article(dom.latestArticle(1)));

                    return {
                        sport: {
                            draft: [{
                                id: 'internal-code/content/1',
                                webPublicationDate: (new Date()).toISOString(),
                                meta: {
                                    group: 3
                                }
                            }]
                        }
                    };
                });
            }

            function insertAfterAnArticle () {
                return editAction(function () {
                    var latestNews = dom.droppableCollection(1);
                    var latestDropTarget = drag.droppable(latestNews);
                    // Drop an article on the collection means adding it to the end
                    latestDropTarget.dragover(latestNews, new drag.Article(dom.latestArticle(2)));
                    latestDropTarget.drop(latestNews, new drag.Article(dom.latestArticle(2)));

                    return {
                        latest: {
                            draft: [{
                                id: 'internal-code/content/1',
                                webPublicationDate: (new Date()).toISOString()
                            }, {
                                id: 'internal-code/content/2',
                                webPublicationDate: (new Date()).toISOString()
                            }]
                        }
                    };
                });
            }

            function insertOnTopOfTheList () {
                return editAction(function () {
                    // Drop an article in the first position
                    var latestNews = dom.droppableCollection(1);
                    var latestDropTarget = drag.droppable(latestNews);
                    var firstArticleInLatest = dom.articleInside(latestNews, 1);
                    // Drop an article on the collection means adding it to the end
                    latestDropTarget.dragover(firstArticleInLatest, new drag.Article(dom.latestArticle(3)));
                    latestDropTarget.drop(firstArticleInLatest, new drag.Article(dom.latestArticle(3)));

                    return {
                        latest: {
                            draft: [{
                                id: 'internal-code/content/3',
                                webPublicationDate: (new Date()).toISOString()
                            }, {
                                id: 'internal-code/content/1',
                                webPublicationDate: (new Date()).toISOString()
                            }, {
                                id: 'internal-code/content/2',
                                webPublicationDate: (new Date()).toISOString()
                            }]
                        }
                    };
                });
            }
        });
    });
});
