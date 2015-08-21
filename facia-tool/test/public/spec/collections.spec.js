import $ from 'jquery';
import MockVisible from 'mock/stories-visible';
import CollectionsLoader from 'test/utils/collections-loader';
import * as dom from 'test/utils/dom-nodes';
import drag from 'test/utils/drag';
import editAction from 'test/utils/edit-actions';
import publishAction from 'test/utils/publish-actions';
import * as wait from 'test/utils/wait';

describe('Collections', function () {
    beforeEach(function () {
        this.testInstance = new CollectionsLoader();
        this.mockVisible = new MockVisible();
    });
    afterEach(function () {
        this.testInstance.dispose();
        this.mockVisible.dispose();
    });

    it('displays the correct timing', function (done) {
        this.testInstance.load()
        .then(() => {
            expect(
                $('.list-header__timings').text().replace(/\s+/g, ' ')
            ).toMatch('1 day ago by Test');
        })
        .then(done)
        .catch(done.fail);
    });

    it('/edits', function (done) {
        var mockCollection = this.testInstance.mockCollections;

        this.testInstance.load()
        .then(insertInEmptyGroup)
        .then(function (request) {
            expect(request.url).toEqual('/edits');
            expect(request.data.type).toEqual('Update');
            expect(request.data.update.after).toEqual(false);
            expect(request.data.update.draft).toEqual(true);
            expect(request.data.update.live).toEqual(false);
            expect(request.data.update.id).toEqual('sport');
            expect(request.data.update.item).toEqual('internal-code/page/1');
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
            expect(request.data.update.item).toEqual('internal-code/page/2');
            expect(!!request.data.update.itemMeta).toEqual(false);
            expect(request.data.update.position).toEqual('internal-code/page/1');

            return insertOnTopOfTheList();
        })
        .then(function (request) {
            expect(request.url).toEqual('/edits');
            expect(request.data.type).toEqual('Update');
            expect(request.data.update.after).toEqual(false);
            expect(request.data.update.draft).toEqual(true);
            expect(request.data.update.live).toEqual(false);
            expect(request.data.update.id).toEqual('latest');
            expect(request.data.update.item).toEqual('internal-code/page/3');
            expect(!!request.data.update.itemMeta).toEqual(false);
            expect(request.data.update.position).toEqual('internal-code/page/1');

            return insertMetadataOnTopOfTheList();
        })
        .then(function (request) {
            expect(request.url).toEqual('/edits');
            expect(request.data.type).toEqual('Update');
            expect('after' in request.data.update).toEqual(false);
            expect(request.data.update.draft).toEqual(true);
            expect(request.data.update.live).toEqual(false);
            expect(request.data.update.id).toEqual('latest');
            expect(request.data.update.item).toEqual('internal-code/page/3');
            expect(request.data.update.itemMeta.isBreaking).toEqual(true);
            expect(request.data.update.position).toEqual('internal-code/page/3');

            return moveFirstItemBelow();
        })
        .then(function (request) {
            expect(request.url).toEqual('/edits');
            expect(request.data.type).toEqual('Update');
            expect(request.data.update.after).toEqual(false);
            expect(request.data.update.draft).toEqual(true);
            expect(request.data.update.live).toEqual(false);
            expect(request.data.update.id).toEqual('latest');
            expect(request.data.update.item).toEqual('internal-code/page/3');
            expect(request.data.update.itemMeta.isBreaking).toEqual(true);
            expect(request.data.update.position).toEqual('internal-code/page/2');

            return moveToAnotherCollections();
        })
        .then(function (request) {
            expect(request.url).toEqual('/edits');
            expect(request.data.type).toEqual('UpdateAndRemove');
            expect(request.data.update.after).toEqual(false);
            expect(request.data.update.draft).toEqual(true);
            expect(request.data.update.live).toEqual(false);
            expect(request.data.update.id).toEqual('sport');
            expect(request.data.update.item).toEqual('internal-code/page/3');
            expect(request.data.update.itemMeta.isBreaking).toEqual(true);
            expect(request.data.update.itemMeta.group).toEqual('3');
            expect(request.data.update.position).toEqual('internal-code/page/1');
            expect(request.data.remove.draft).toEqual(true);
            expect(request.data.remove.live).toEqual(false);
            expect(request.data.remove.id).toEqual('latest');
            expect(request.data.remove.item).toEqual('internal-code/page/3');

            return removeItemFromGroup();
        })
        .then(function (request) {
            expect(request.url).toEqual('/edits');
            expect(request.data.type).toEqual('Remove');
            expect(request.data.remove.draft).toEqual(true);
            expect(request.data.remove.live).toEqual(false);
            expect(request.data.remove.id).toEqual('sport');
            expect(request.data.remove.item).toEqual('internal-code/page/1');

            return addSublinkInArticle();
        })
        .then(function (request) {
            expect(request.url).toEqual('/edits');
            expect(request.data.type).toEqual('Update');
            expect(request.data.update.draft).toEqual(true);
            expect(request.data.update.live).toEqual(false);
            expect(request.data.update.id).toEqual('latest');
            expect(request.data.update.item).toEqual('internal-code/page/2');
            expect(request.data.update.itemMeta.supporting[0].id).toEqual('internal-code/page/5');

            return publishLatestChanges();
        })
        .then(function (collection) {
            expect(collection).toEqual('latest');
        })
        .then(done);

        function insertInEmptyGroup () {
            return editAction(mockCollection, function () {
                var firstGroup = dom.droppableGroup(2, 1);
                drag.droppable(firstGroup).drop(firstGroup, new drag.Article(dom.latestArticle(1)));

                return {
                    sport: {
                        draft: [{
                            id: 'internal-code/page/1',
                            meta: {
                                group: 3
                            }
                        }]
                    }
                };
            });
        }

        function insertAfterAnArticle () {
            return editAction(mockCollection, function () {
                var firstCollection = dom.droppableCollection(1);
                var collectionDropTarget = drag.droppable(firstCollection);
                var sourceArticle = new drag.Article(dom.latestArticle(2));
                // Drop an article on the collection means adding it to the end
                collectionDropTarget.dragover(firstCollection, sourceArticle);
                collectionDropTarget.drop(firstCollection, sourceArticle);

                return {
                    latest: {
                        draft: [{
                            id: 'internal-code/page/1'
                        }, {
                            id: 'internal-code/page/2'
                        }]
                    }
                };
            });
        }

        function insertOnTopOfTheList () {
            return editAction(mockCollection, function () {
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
                            id: 'internal-code/page/3'
                        }, {
                            id: 'internal-code/page/1'
                        }, {
                            id: 'internal-code/page/2'
                        }]
                    }
                };
            });
        }

        function insertMetadataOnTopOfTheList () {
            return editAction(mockCollection, function () {
                var firstCollection = dom.droppableCollection(1);
                var firstArticleInLatest = dom.articleInside(firstCollection, 1);

                dom.click(firstArticleInLatest);
                dom.click(firstArticleInLatest.querySelector('.editor--boolean--isBreaking'));
                dom.click(firstArticleInLatest.querySelector('.tool--done'));

                return {
                    latest: {
                        draft: [{
                            id: 'internal-code/page/3',
                            meta: {
                                isBreaking: true
                            }
                        }, {
                            id: 'internal-code/page/1'
                        }, {
                            id: 'internal-code/page/2'
                        }]
                    }
                };
            });
        }

        function moveFirstItemBelow () {
            return editAction(mockCollection, function () {
                // Drop an article in the first position
                var firstCollection = dom.droppableCollection(1);
                var collectionDropTarget = drag.droppable(firstCollection);
                var firstArticleInCollection = dom.articleInside(firstCollection, 1);
                var thirdArticleInCollection = dom.articleInside(firstCollection, 3);
                var sourceArticle = new drag.Article(firstArticleInCollection);
                // Drop an article on the collection means adding it to the end
                collectionDropTarget.dragstart(firstArticleInCollection, sourceArticle);
                collectionDropTarget.dragover(thirdArticleInCollection, sourceArticle);
                collectionDropTarget.drop(thirdArticleInCollection, sourceArticle);

                return {
                    latest: {
                        draft: [{
                            id: 'internal-code/page/1'
                        }, {
                            id: 'internal-code/page/3',
                            meta: {
                                isBreaking: true
                            }
                        }, {
                            id: 'internal-code/page/2'
                        }]
                    }
                };
            });
        }

        function moveToAnotherCollections () {
            return editAction(mockCollection, function () {
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
                            id: 'internal-code/page/1'
                        }, {
                            id: 'internal-code/page/2'
                        }]
                    },
                    sport: {
                        draft: [{
                            id: 'internal-code/page/3',
                            meta: {
                                isBreaking: true,
                                group: 3
                            }
                        }, {
                            id: 'internal-code/page/1',
                            meta: {
                                group: 3
                            }
                        }]
                    }
                };
            });
        }

        function removeItemFromGroup () {
            return editAction(mockCollection, function () {
                var sportNews = dom.droppableGroup(2, 1);
                var articleToRemove = dom.articleInside(sportNews, 2);

                dom.click(articleToRemove.querySelector('.tool--small--remove'));

                return {
                    sport: {
                        draft: [{
                            id: 'internal-code/page/3',
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
            return editAction(mockCollection, function () {
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
                            id: 'internal-code/page/1'
                        }, {
                            id: 'internal-code/page/2',
                            meta: {
                                supporting: [{
                                    id: 'internal-code/page/5'
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

    it('stories visible', function (done) {
        var mockCollection = this.testInstance.mockCollections;

        this.mockVisible.set({
            'slow/slower/slowest': {
                desktop: 1,
                mobile: 1
            }
        });
        this.testInstance.load()
        .then(() => {
            return editAction(mockCollection, function () {
                var lastGroup = dom.droppableGroup(2, 4);
                drag.droppable(lastGroup).drop(lastGroup, new drag.Article(dom.latestArticle(5)));

                return {
                    sport: {
                        draft: [{
                            id: 'internal-code/page/5',
                            meta: {
                                group: 0
                            }
                        }]
                    }
                };
            });
        })
        .then(() => wait.event('visible:stories:fetch'))
        .then(function () {
            expect($('.desktop-indicator .indicator')[0].clientHeight > 100).toBe(true);
        })
        .then(done)
        .catch(done.fail);
    });

    it('copy paste abouve an article', function (done) {
        var mockCollection = this.testInstance.mockCollections;

        this.testInstance.load()
        .then(() => {
            return editAction(mockCollection, () => {
                $('.tool--small--copy', dom.latestArticle(5)).click();
                $('collection-widget trail-widget:nth(0) .tool--small--paste').click();

                return {
                    latest: {
                        draft: [{
                            id: 'internal-code/page/5',
                            meta: {
                                group: 0
                            }
                        }, {
                            id: 'internal-code/page/1',
                            meta: {
                                group: 0
                            }
                        }]
                    }
                };
            });
        })
        .then(request => {
            expect(request.url).toBe('/edits');
            expect(request.data.type).toBe('Update');
            expect(request.data.update).toEqual({
                after: false,
                live: false,
                draft: true,
                id: 'latest',
                item: 'internal-code/page/5',
                position: 'internal-code/page/1'
            });
        })
        .then(done)
        .catch(done.fail);
    });
});
