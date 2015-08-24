import ko from 'knockout';
import _ from 'underscore';
import $ from 'jquery';
import * as cache from 'modules/cache';
import Droppable from 'modules/droppable';
import {CONST} from 'modules/vars';
import * as widgets from 'models/widgets';
import mediator from 'utils/mediator';
import inject from 'test/utils/inject';
import * as mockjax from 'test/utils/mockjax';
import textInside from 'test/utils/text-inside';
import * as wait from 'test/utils/wait';

// Store the original settimeout
var injectedClipboard;

describe('Clipboard', function () {
    beforeEach(function () {
        window.localStorage.clear();
        this.droppable = new Droppable();
        widgets.register();
        cache.put('contentApi', 'internal-code/page/first', {
            'webUrl': 'http://theguardian.com/banana',
            'fields': {
                'headline': 'Bananas are yellow'
            }
        });
        this.scope = mockjax.scope();
        this.scope({
            url: '/api/proxy/piuccio*',
            responseText: {}
        });
        this.originaldetectPendingChangesInClipboard = CONST.detectPendingChangesInClipboard;
        CONST.detectPendingChangesInClipboard = 300;
    });
    afterEach(function () {
        this.scope.clear();
        this.droppable.dispose();
        injectedClipboard.dispose();
        CONST.detectPendingChangesInClipboard = this.originaldetectPendingChangesInClipboard;
    });

    it('loads items from the history', function (done) {
        injectClipboard()
        .then(testDraggingAnArticle)
        .then(testLoadingFromStorage)
        .then(testLoadingAfterDelete)
        .then(testChangingMetadata)
        .then(done)
        .catch(done.fail);

        function testDraggingAnArticle (clipboard) {
            // Local storage was cleared, the clipboard should be empty
            expect(getArticles().length).toBe(0);

            return dragArticle({
                id: 'internal-code/page/first'
            }, clipboard)
            .then(() => {
                expect(getArticles().length).toBe(1);
                expect(getArticles()[0].headline).toBe('Bananas are yellow');

                // Destroy the clipboard and initialize again
                return injectClipboard();
            });
        }

        function testLoadingFromStorage (clipboard) {
            expect(getArticles().length).toBe(1);
            expect(getArticles()[0].headline).toBe('Bananas are yellow');

            return dragArticle({
                id: 'internal-code/page/first'
            }, clipboard)
            .then(() => {
                return dragArticle({
                    id: 'https://github.com/piuccio',
                    meta: {
                        headline: 'GitHub',
                        snapType: 'link'
                    }
                }, clipboard)
                .then(testRemovingItems);
            });
        }

        function testRemovingItems (clipboard) {
            expect(getArticles().length).toBe(2);
            expect(getArticles()[0].headline).toBe('Bananas are yellow');
            expect(getArticles()[1].headline).toBe('GitHub');

            // Delete and item and check that it's not in storage anymore
            return removeArticle({
                id: 'internal-code/page/first'
            }, clipboard)
            .then(injectClipboard);
        }

        function testLoadingAfterDelete (clipboard) {
            expect(getArticles().length).toBe(1);
            expect(getArticles()[0].headline).toBe('GitHub');

            return changeHeadline(0, 'Open Source', clipboard)
            .then(() => {
                expect(getArticles()[0].headline).toBe('Open Source');
                return injectClipboard();
            });
        }

        function testChangingMetadata () {
            expect(getArticles().length).toBe(1);
            expect(getArticles()[0].headline).toBe('Open Source');
        }
    });
});

function injectClipboard () {
    if (injectedClipboard) {
        injectedClipboard.dispose();
    }

    injectedClipboard = inject(`
        <clipboard-widget params="position: 0, column: $data"></clipboard-widget>
    `);
    return injectedClipboard.apply({
        switches: ko.observable({
            'facia-tool-sparklines': false
        })
    }, true);
}

function getArticles () {
    var articles = [];
    $('trail-widget').each(function (i, elem) {
        articles.push({
            headline: textInside($(elem).find('.element__headline')),
            dom: $(elem)
        });
    });
    return articles;
}

function dragArticle (article, clipboard) {
    mediator.emit('drop', {
        sourceItem: article,
        sourceGroup: null
    }, clipboard.group, clipboard.group);
    // Let knockout refresh the HTML
    return wait.ms(CONST.detectPendingChangesInClipboard + 50).then(() => clipboard);
}

function removeArticle (article, clipboard) {
    var actualArticle = _.find(clipboard.group.items(), function (item) {
        return item.id() === article.id;
    });
    clipboard.group.omitItem(actualArticle);
    return wait.ms(CONST.detectPendingChangesInClipboard + 50).then(() => clipboard);
}

function changeHeadline (position, newHeadline, clipboard) {
    var article = clipboard.group.items()[position];
    article.meta.headline(newHeadline);
    return wait.ms(CONST.detectPendingChangesInClipboard + 50).then(() => clipboard);
}
