import $ from 'jquery';
import EventEmitter from 'EventEmitter';
import Loader from 'test/utils/breaking-news-loader';
import * as dom from 'test/utils/dom-nodes';
import * as mockjax from 'test/utils/mockjax';
import textInside from 'test/utils/text-inside';
import * as wait from 'test/utils/wait';

describe('Breaking News', function () {
    beforeEach(function (done) {
        this.loader = new Loader(this, done);
        this.scope = mockjax.scope();
    });
    afterEach(function () {
        this.scope.clear();
        this.loader.dispose(this);
    });

    it('Alerts the user before launch', function (done) {
        var countRequest = 0, bus = new EventEmitter(),
            lastRequest, desiredAnswer, mockCollection = this.mockCollections;
        this.scope({
            url: '/edits',
            response: function (request) {
                countRequest += 1;
                lastRequest = request;
                lastRequest.data = JSON.parse(request.data);
                this.responseText = desiredAnswer;
            },
            onAfterComplete: function () {
                setTimeout(() => bus.emit('complete', lastRequest), 20);
            }
        }, {
            url: '/collection/publish/global',
            responseText: '',
            onAfterComplete: function () {
                countRequest += 1;
                wait.event('complete', mockCollection).then(() => setTimeout(() => {
                    bus.emit('publish');
                }, 20));
            }
        }, {
            url: '/collection/discard/uk-alerts',
            responseText: '',
            onAfterComplete: function () {
                countRequest += 1;
                wait.event('complete', mockCollection).then(() => setTimeout(() => {
                    bus.emit('discard');
                }, 20));
            }
        });

        expect($('.front-selector').length).toBe(0);

        copyPasteArticle()
        .then((request) => {
            expect(request.url).toBe('/edits');
            expect(request.type.toLowerCase()).toBe('post');
            expect(request.data.type).toBe('Update');
            expect(request.data.update).toEqual({
                after: false,
                draft: true,
                id: 'global',
                item: 'internal-code/page/1',
                itemMeta: { group: '0' },
                live: false
            });
            expect(countRequest).toBe(1);

            return clickPublishDraft();
        })
        .then(() => {
            expect($('.modalDialog-confirm').is(':visible')).toBe(true);
            $('.cancelAlert').click();
        })
        .then(() => {
            // No network request
            expect(countRequest).toBe(1);
            expect($('collection-widget:nth(0) trail-widget').length).toBe(1);
            return clickPublishDraft();
        })
        .then(() => {
            expect($('.modalDialog-confirm').is(':visible')).toBe(true);
            return publishAndSendAlert();
        })
        .then(() => {
            expect(countRequest).toBe(2);
            expect($('collection-widget:nth(0) trail-widget').length).toBe(1);
            expect($('collection-widget:nth(0) .draft-publish').is(':visible')).toBe(false);

            return tryToAddAnotherStory();
        })
        .then(() => {
            expect($('collection-widget:nth(0) trail-widget').length).toBe(1);
            expect(textInside('.modalDialog-message')).toMatch(/only have one article/i);
            $('.button-action').click();

            return removeTheStory();
        })
        .then(() => {
            expect(countRequest).toBe(3);
            expect($('collection-widget:nth(0) trail-widget').length).toBe(0);

            return clickLaunchDraft();
        })
        .then(() => {
            expect(countRequest).toBe(4);
            expect($('collection-widget:nth(0) .history trail-widget').length).toBe(1);

            return dragFromHistory();
        })
        .then((request) => {
            expect(request.url).toBe('/edits');
            expect(request.type.toLowerCase()).toBe('post');
            expect(request.data.type).toBe('Update');
            expect(request.data.update).toEqual({
                after: false,
                draft: true,
                id: 'uk-alerts',
                item: 'internal-code/page/1',
                itemMeta: { group: '1' },
                live: false
            });
            expect(countRequest).toBe(5);

            expect($('collection-widget:nth(0) .history trail-widget').length).toBe(1);
            expect($('collection-widget:nth(1) trail-widget').length).toBe(1);

            return discardChanges();
        })
        .then(() => {
            expect(countRequest).toBe(6);
            expect($('collection-widget:nth(0) .history trail-widget').length).toBe(1);
            expect($('collection-widget:nth(1) trail-widget').length).toBe(0);
        })
        .then(done)
        .catch(done.fail);


        function copyPasteArticle () {
            var copyArticle = dom.latestArticle(0);
            $('.tool--small--copy', copyArticle).click();
            $('collection-widget:nth(0) .pasteOver:nth(1)').click();

            desiredAnswer = {
                global: {
                    draft: [{
                        id: 'internal-code/page/1',
                        meta: { group: 0 }
                    }],
                    lastUpdated: (new Date()).toISOString()
                }
            };
            mockCollection.set(desiredAnswer);
            return wait.event('complete', bus);
        }

        function clickPublishDraft () {
            let alertButton = $('collection-widget:nth(0) .draft-publish');
            expect(alertButton.is(':visible')).toBe(true);
            expect(textInside(alertButton)).toBe('Send alert');

            // Check the alert message
            alertButton.click();
            return wait.ms(100);
        }

        function publishAndSendAlert () {
            $('.sendAlert').click();
            mockCollection.set({
                global: {
                    live: [{
                        id: 'internal-code/page/1',
                        meta: { group: 0 }
                    }],
                    lastUpdated: (new Date()).toISOString()
                }
            });
            return wait.event('publish', bus);
        }

        function tryToAddAnotherStory () {
            var copyArticle = dom.latestArticle(2);
            $('.tool--small--copy', copyArticle).click();
            $('collection-widget:nth(0) .pasteOver:nth(0)').click();

            return wait.ms(100);
        }

        function removeTheStory () {
            $('collection-widget:nth(0) .tool--small--remove').click();

            desiredAnswer = {
                global: {
                    draft: [],
                    live: [{
                        id: 'internal-code/page/1'
                    }],
                    lastUpdated: (new Date()).toISOString()
                }
            };
            mockCollection.set(desiredAnswer);
            return wait.event('complete', bus);
        }

        function clickLaunchDraft () {
            let alertButton = $('collection-widget:nth(0) .draft-publish');
            expect(alertButton.is(':visible')).toBe(true);
            expect(textInside(alertButton)).toBe('Launch');

            // Check the alert message
            desiredAnswer = {
                global: {
                    live: [],
                    previously: [{
                        id: 'internal-code/page/1'
                    }],
                    lastUpdated: (new Date()).toISOString()
                }
            };
            mockCollection.set(desiredAnswer);
            alertButton.click();
            return wait.event('publish', bus);
        }

        function dragFromHistory () {
            var copyArticle = $('collection-widget:nth(0) .history .article')[0];
            $('.tool--small--copy', copyArticle).click();
            $('collection-widget:nth(1) .pasteOver:nth(0)').click();

            desiredAnswer = {
                'uk-alerts': {
                    draft: [{
                        id: 'internal-code/page/1',
                        meta: { group: 1 }
                    }],
                    live: [],
                    lastUpdated: (new Date()).toISOString()
                }
            };
            mockCollection.set(desiredAnswer);
            return wait.event('complete', bus);
        }

        function discardChanges () {
            $('collection-widget:nth(1) .draft-discard').click();

            desiredAnswer = {
                'uk-alerts': {
                    live: [],
                    lastUpdated: (new Date()).toISOString()
                }
            };
            mockCollection.set(desiredAnswer);
            return wait.event('discard', bus);
        }
    });
});
