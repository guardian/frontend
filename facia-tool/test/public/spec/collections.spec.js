define([
    'test/utils/async-test',
    'test/utils/drag',
    'mock/collection',
    'mock/stories-visible',
    'test/utils/edit-actions',
    'test/utils/publish-actions',
    'test/utils/dom-nodes'
], function(
    test,
    drag,
    mockCollection,
    mockVisible,
    editAction,
    publishAction,
    dom
){
    describe('Collections', function () {
        test('collections', 'displays the correct timing', function (done) {
            expect(
                $('.list-header__timings').text().replace(/\s+/g, ' ')
            ).toMatch('1 day ago by Test');
            done();
        });

        test('collections', '/edits', function (done) {

            insertInEmptyGroup()
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
            })
            .then(function (request) {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.after).toEqual(true);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('latest');
                expect(request.data.update.item).toEqual('internal-code/content/2');
                expect(!!request.data.update.itemMeta).toEqual(false);
                expect(request.data.update.position).toEqual('internal-code/content/1');

                return insertOnTopOfTheList();
            })
            .then(function (request) {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.after).toEqual(false);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('latest');
                expect(request.data.update.item).toEqual('internal-code/content/3');
                expect(!!request.data.update.itemMeta).toEqual(false);
                expect(request.data.update.position).toEqual('internal-code/content/1');

                return insertMetadataOnTopOfTheList();
            })
            .then(function (request) {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect('after' in request.data.update).toEqual(false);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('latest');
                expect(request.data.update.item).toEqual('internal-code/content/3');
                expect(request.data.update.itemMeta.isBreaking).toEqual(true);
                expect(request.data.update.position).toEqual('internal-code/content/3');

                return moveFirstItemBelow();
            })
            .then(function (request) {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.after).toEqual(false);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('latest');
                expect(request.data.update.item).toEqual('internal-code/content/3');
                expect(request.data.update.itemMeta.isBreaking).toEqual(true);
                expect(request.data.update.position).toEqual('internal-code/content/2');

                return moveToAnotherCollections();
            })
            .then(function (request) {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('UpdateAndRemove');
                expect(request.data.update.after).toEqual(false);
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('sport');
                expect(request.data.update.item).toEqual('internal-code/content/3');
                expect(request.data.update.itemMeta.isBreaking).toEqual(true);
                expect(request.data.update.itemMeta.group).toEqual('3');
                expect(request.data.update.position).toEqual('internal-code/content/1');
                expect(request.data.remove.draft).toEqual(true);
                expect(request.data.remove.live).toEqual(false);
                expect(request.data.remove.id).toEqual('latest');
                expect(request.data.remove.item).toEqual('internal-code/content/3');

                return removeItemFromGroup();
            })
            .then(function (request) {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Remove');
                expect(request.data.remove.draft).toEqual(true);
                expect(request.data.remove.live).toEqual(false);
                expect(request.data.remove.id).toEqual('sport');
                expect(request.data.remove.item).toEqual('internal-code/content/1');

                return addSublinkInArticle();
            })
            .then(function (request) {
                expect(request.url).toEqual('/edits');
                expect(request.data.type).toEqual('Update');
                expect(request.data.update.draft).toEqual(true);
                expect(request.data.update.live).toEqual(false);
                expect(request.data.update.id).toEqual('latest');
                expect(request.data.update.item).toEqual('internal-code/content/2');
                expect(request.data.update.itemMeta.supporting[0].id).toEqual('internal-code/content/5');

                return publishLatestChanges();
            })
            .then(function (collection) {
                expect(collection).toEqual('latest');
            })
            .then(done);

            function insertInEmptyGroup () {
                return editAction(function () {
                    var firstGroup = dom.droppableGroup(2, 1);
                    drag.droppable(firstGroup).drop(firstGroup, new drag.Article(dom.latestArticle(1)));

                    return {
                        sport: {
                            draft: [{
                                id: 'internal-code/content/1',
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
                    var firstCollection = dom.droppableCollection(1);
                    var collectionDropTarget = drag.droppable(firstCollection);
                    var sourceArticle = new drag.Article(dom.latestArticle(2));
                    // Drop an article on the collection means adding it to the end
                    collectionDropTarget.dragover(firstCollection, sourceArticle);
                    collectionDropTarget.drop(firstCollection, sourceArticle);

                    return {
                        latest: {
                            draft: [{
                                id: 'internal-code/content/1'
                            }, {
                                id: 'internal-code/content/2'
                            }]
                        }
                    };
                });
            }

            function insertOnTopOfTheList () {
                return editAction(function () {
                    // Drop an article in the first position
                    var firstCollection = dom.droppableCollection(1);
                    var collectionDropTarget = drag.droppable(firstCollection);
                    var firstArticleInLatest = dom.articleInside(firstCollection, 1);
                    var sourceArticle = new drag.Article(dom.latestArticle(3));
                    // Drop an article on the collection means adding it to the end
                    collectionDropTarget.dragover(firstArticleInLatest, sourceArticle);
                    collectionDropTarget.drop(firstArticleInLatest, sourceArticle);

                    return {
                        latest: {
                            draft: [{
                                id: 'internal-code/content/3'
                            }, {
                                id: 'internal-code/content/1'
                            }, {
                                id: 'internal-code/content/2'
                            }]
                        }
                    };
                });
            }

            function insertMetadataOnTopOfTheList () {
                return editAction(function () {
                    var firstCollection = dom.droppableCollection(1);
                    var firstArticleInLatest = dom.articleInside(firstCollection, 1);

                    dom.click(firstArticleInLatest);
                    dom.click(firstArticleInLatest.querySelector('.editor--boolean--isBreaking'));
                    dom.click(firstArticleInLatest.querySelector('.tool--done'));

                    return {
                        latest: {
                            draft: [{
                                id: 'internal-code/content/3',
                                meta: {
                                    isBreaking: true
                                }
                            }, {
                                id: 'internal-code/content/1'
                            }, {
                                id: 'internal-code/content/2'
                            }]
                        }
                    };
                });
            }

            function moveFirstItemBelow () {
                return editAction(function () {
                    // Drop an article in the first position
                    var firstCollection = dom.droppableCollection(1);
                    var collectionDropTarget = drag.droppable(firstCollection);
                    var firstArticleInLatest = dom.articleInside(firstCollection, 1);
                    var thirdArticleInLatest = dom.articleInside(firstCollection, 3);
                    var sourceArticle = new drag.Article(firstArticleInLatest);
                    // Drop an article on the collection means adding it to the end
                    collectionDropTarget.dragstart(firstArticleInLatest, sourceArticle);
                    collectionDropTarget.dragover(thirdArticleInLatest, sourceArticle);
                    collectionDropTarget.drop(thirdArticleInLatest, sourceArticle);

                    return {
                        latest: {
                            draft: [{
                                id: 'internal-code/content/1'
                            }, {
                                id: 'internal-code/content/3',
                                meta: {
                                    isBreaking: true
                                }
                            }, {
                                id: 'internal-code/content/2'
                            }]
                        }
                    };
                });
            }

            function moveToAnotherCollections () {
                return editAction(function () {
                    // The item with meta data is now in position two
                    var firstCollection = dom.droppableCollection(1);
                    var collectionDropTarget = drag.droppable(firstCollection);
                    var itemWithMeta = dom.articleInside(firstCollection, 2);
                    var sportDropGroup = dom.droppableGroup(2, 1);
                    var sportDropTarget = drag.droppable(sportDropGroup);
                    var articleAlreadyThere = dom.articleInside(sportDropGroup, 1);
                    var sourceArticle = new drag.Article(itemWithMeta);
                    // Move it to the sport collection
                    collectionDropTarget.dragstart(itemWithMeta, sourceArticle);
                    collectionDropTarget.dragleave(itemWithMeta, sourceArticle);
                    sportDropTarget.dragover(articleAlreadyThere, sourceArticle);
                    sportDropTarget.drop(articleAlreadyThere, sourceArticle);

                    return {
                        latest: {
                            draft: [{
                                id: 'internal-code/content/1'
                            }, {
                                id: 'internal-code/content/2'
                            }]
                        },
                        sport: {
                            draft: [{
                                id: 'internal-code/content/3',
                                meta: {
                                    isBreaking: true,
                                    group: 3
                                }
                            }, {
                                id: 'internal-code/content/1',
                                meta: {
                                    group: 3
                                }
                            }]
                        }
                    };
                });
            }

            function removeItemFromGroup () {
                return editAction(function () {
                    var sportNews = dom.droppableGroup(2, 1);
                    var articleToRemove = dom.articleInside(sportNews, 2);

                    dom.click(articleToRemove.querySelector('.tool--small--remove'));

                    return {
                        sport: {
                            draft: [{
                                id: 'internal-code/content/3',
                                meta: {
                                    isBreaking: true,
                                    group: 3
                                }
                            }]
                        }
                    };
                });
            }

            function addSublinkInArticle () {
                return editAction(function () {
                    var latestNews = dom.droppableCollection(1);
                    var articleWithSublink = dom.articleInside(latestNews, 2);
                    dom.click(articleWithSublink);

                    var supportingLinkElement = articleWithSublink.querySelector('.supporting .droppable');
                    var supportingDropTarget = drag.droppable(supportingLinkElement);
                    var lastNewArticle = dom.latestArticle(5);
                    var sublink = new drag.Article(lastNewArticle);
                    supportingDropTarget.drop(supportingLinkElement, sublink);
                    dom.click(articleWithSublink.querySelector('.tool--done'));

                    return {
                        latest: {
                            draft: [{
                                id: 'internal-code/content/1'
                            }, {
                                id: 'internal-code/content/2',
                                meta: {
                                    supporting: [{
                                        id: 'internal-code/content/5'
                                    }]
                                }
                            }]
                        }
                    };
                });
            }

            function publishLatestChanges () {
                return publishAction(function () {
                    var launchButton = dom.collection(1).querySelector('.draft-publish');
                    dom.click(launchButton);
                });
            }
        });

        test('collections', 'stories visible', function (done) {
            mockVisible.set({
                'slow/slower/slowest': {
                    desktop: 1,
                    mobile: 1
                }
            });
            editAction(function () {
                var lastGroup = dom.droppableGroup(2, 4);
                drag.droppable(lastGroup).drop(lastGroup, new drag.Article(dom.latestArticle(5)));

                return {
                    sport: {
                        draft: [{
                            id: 'internal-code/content/5',
                            meta: {
                                group: 0
                            }
                        }]
                    }
                };
            }).then(function () {
                expect($('.desktop-indicator .indicator')[1].clientHeight > 100).toBe(true);
            });
            done();
        });
    });
});
