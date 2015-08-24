import $ from 'jquery';
import Promise from 'Promise';
import MockVisible from 'mock/stories-visible';
import CollectionsLoader from 'test/utils/collections-loader';
import * as dom from 'test/utils/dom-nodes';
import drag from 'test/utils/drag';
import editAction from 'test/utils/edit-actions';
import * as mockjax from 'test/utils/mockjax';
import textInside from 'test/utils/text-inside';
import * as wait from 'test/utils/wait';

describe('Alternate Drag', function () {
    beforeEach(function (done) {
        this.testInstance = new CollectionsLoader();
        this.mockVisible = new MockVisible();
        this.scope = mockjax.scope();
        this.testInstance.load().then(done);
    });
    afterEach(function () {
        this.testInstance.dispose();
        this.mockVisible.dispose();
        this.scope.clear();
    });

    it('replace article and drags sublinks', function (done) {
        var mockCollection = this.testInstance.mockCollections,
            mockScope = this.scope;

        openArticle()
        .then(selectSomeMetadata)
        .then(dragSublink)
        .then(copyPasteSublink)
        .then(saveArticle)
        .then(expectChangesSaved)
        .then(openArticle)
        .then(alternateDrag)
        .then(expectItemSwapped)
        .then(openArticle)
        .then(deleteOneSublink)
        .then(saveArticleWithOneSublink)
        .then(expectSublinkDeleted)
        .then(deleteEntireArticle)
        .then(expectDeleteRequestSent)
        .then(done)
        .catch(done.fail);


        function openArticle () {
            $('collection-widget .element__headline:nth(0)').click();
            return Promise.resolve();
        }
        function selectSomeMetadata () {
            $('.editor--boolean--isBreaking').click();
            $('.editor--boolean--showBoostedHeadline').click();
        }
        function dragSublink () {
            var droppableRegionInsideArticle = $('collection-widget trail-widget .droppable')[0];
            var dropTarget = drag.droppable(droppableRegionInsideArticle);
            var sourceArticle = new drag.Article(dom.latestArticle(2));
            return dropTarget.drop(droppableRegionInsideArticle, sourceArticle).then(() => wait.ms(10));
        }
        function copyPasteSublink () {
            $('.tool--small--copy', dom.latestArticle(3)).click();
            $('collection-widget trail-widget .pasteOver').click();
            return wait.ms(10);
        }
        function saveArticle () {
            return editAction(mockCollection, () => {
                $('collection-widget trail-widget:nth(0) .tool--done').click();

                return {
                    latest: {
                        draft: [{
                            id: 'internal-code/page/1',
                            meta: {
                                isBreaking: true,
                                showBoostedHeadline: true,
                                supporting: [
                                    { id: 'internal-code/page/2' },
                                    { id: 'internal-code/page/3' }
                                ]
                            }
                        }]
                    }
                };
            });
        }
        function expectChangesSaved (request) {
            expect(request.url).toBe('/edits');
            expect(request.data).toEqual({
                type: 'Update',
                update: {
                    live: false,
                    draft: true,
                    id: 'latest',
                    item: 'internal-code/page/1',
                    position: 'internal-code/page/1',
                    itemMeta: {
                        group: '0',
                        isBreaking: true,
                        showBoostedHeadline: true,
                        supporting: [
                            { id: 'internal-code/page/2' },
                            { id: 'internal-code/page/3' }
                        ]
                    }
                }
            });
        }
        function alternateDrag () {
            // This action is making to consecutive requests
            var requestIndex = 0, requests = [], responses = [{
                latest: {
                    lastUpdated: (new Date()).toISOString(),
                    draft: [{
                        id: 'internal-code/page/4',
                            meta: {
                                isBreaking: true,
                                showBoostedHeadline: true,
                                supporting: [
                                    { id: 'internal-code/page/2' },
                                    { id: 'internal-code/page/3' }
                                ]
                            }
                    }, {
                        id: 'internal-code/page/1',
                            meta: {
                                isBreaking: true,
                                showBoostedHeadline: true,
                                supporting: [
                                    { id: 'internal-code/page/2' },
                                    { id: 'internal-code/page/3' }
                                ]
                            }
                    }]
                }
            }, {
                latest: {
                    lastUpdated: (new Date()).toISOString() + 10,
                    draft: [{
                        id: 'internal-code/page/4',
                            meta: {
                                isBreaking: true,
                                showBoostedHeadline: true,
                                supporting: [
                                    { id: 'internal-code/page/2' },
                                    { id: 'internal-code/page/3' }
                                ]
                            }
                    }]
                }
            }];
            mockScope({
                url: '/edits',
                method: 'post',
                response: function (req) {
                    requests.push(JSON.parse(req.data));
                    this.responseText = responses[requestIndex];
                    mockCollection.set(this.responseText);
                    requestIndex += 1;
                }
            });

            return new Promise(resolve => {
                var articleToBeReplaced = $('collection-widget trail-widget:nth(0) .droppable')[0];
                var dropTarget = drag.droppable(articleToBeReplaced);
                var sourceArticle = new drag.Article(dom.latestArticle(4));

                dropTarget.drop(articleToBeReplaced, sourceArticle, true)
                .then(() => wait.ms(10))
                .then(() => {
                    expect(requests.length).toBe(2);
                    expect(requests[0]).toEqual({
                        type: 'Update',
                        update: {
                            live: false,
                            draft: true,
                            id: 'latest',
                            item: 'internal-code/page/4',
                            position: 'internal-code/page/1',
                            after: false,
                            itemMeta: {
                                isBreaking: true,
                                showBoostedHeadline: true,
                                supporting: [
                                    { id: 'internal-code/page/2' },
                                    { id: 'internal-code/page/3' }
                                ]
                            }
                        }
                    });
                    expect(requests[1]).toEqual({
                        type: 'Remove',
                        remove: {
                            live: false,
                            draft: true,
                            id: 'latest',
                            item: 'internal-code/page/1'
                        }
                    });

                    resolve();
                });
            });
        }
        function expectItemSwapped () {
            mockScope.clear();
            expect($('collection-widget .element__headline').length).toBe(1);
            expect(textInside('collection-widget .element__headline')).toBe('Santa Claus is a real thing');
        }
        function deleteOneSublink () {
            // Sublink need populating
            return wait.ms(50).then(() => {
                return editAction(mockCollection, () => {
                    $('collection-widget .supporting trail-widget:nth(1) .tool--small--remove').click();

                    return {
                        latest: {
                            draft: [{
                                id: 'internal-code/page/4',
                                meta: {
                                    isBreaking: true,
                                    showBoostedHeadline: true,
                                    supporting: [
                                        { id: 'internal-code/page/2' }
                                    ]
                                }
                            }]
                        }
                    };
                });
            });
        }
        function saveArticleWithOneSublink () {
            return editAction(mockCollection, () => {
                $('collection-widget trail-widget:nth(0) .tool--done').click();

                return {
                    latest: {
                        draft: [{
                            id: 'internal-code/page/4',
                            meta: {
                                isBreaking: true,
                                showBoostedHeadline: true,
                                supporting: [
                                    { id: 'internal-code/page/2' }
                                ]
                            }
                        }]
                    }
                };
            });
        }
        function expectSublinkDeleted (request) {
            expect(request.url).toBe('/edits');
            expect(request.data).toEqual({
                type: 'Update',
                update: {
                    live: false,
                    draft: true,
                    id: 'latest',
                    item: 'internal-code/page/4',
                    position: 'internal-code/page/4',
                    itemMeta: {
                        group: '0',
                        isBreaking: true,
                        showBoostedHeadline: true,
                        supporting: [
                            { id: 'internal-code/page/2' }
                        ]
                    }
                }
            });
        }
        function deleteEntireArticle () {
            return editAction(mockCollection, () => {
                $('collection-widget trail-widget:nth(0) .tool--small--remove').click();

                return {
                    latest: {
                        live: []
                    }
                };
            });
        }
        function expectDeleteRequestSent (request) {
            expect(request.url).toBe('/edits');
            expect(request.data).toEqual({
                type: 'Remove',
                remove: {
                    live: false,
                    draft: true,
                    id: 'latest',
                    item: 'internal-code/page/4'
                }
            });
            expect($('collection-widget trail-widget').length).toBe(0);
        }
    });
});
