import ko from 'knockout';
import _ from 'underscore';
import $ from 'jquery';
import mockjax from 'test/utils/mockjax';
import cache from 'modules/cache';
import vars from 'modules/vars';
import newItems from 'models/collections/new-items';
import * as widgets from 'models/widgets';
import listManager from 'modules/list-manager';
import mediator from 'utils/mediator';

// Store the original settimeout
var yeld = setTimeout;

describe('Clipboard', function () {
    beforeAll(function () {
        setUpTests();
    });
    beforeEach(function () {
        jasmine.clock().install();
    });
    afterAll(function () {
        clearTests();
    });
    afterEach(function () {
        jasmine.clock().uninstall();
    });

    it('loads items from the history', function (done) {
        function testDraggingAnArticle (clipboard) {
            // Local storage was cleared, the clipboard should be empty
            expect(getArticles().length).toBe(0);

            dragArticle({
                id: 'internal-code/content/first'
            }, clipboard, function () {
                expect(getArticles().length).toBe(1);
                expect(getArticles()[0].headline).toBe('Bananas are yellow');

                // Destroy the clipboard and initialize again
                injectClipboard(testLoadingFromStorage);
            });
        }

        function testLoadingFromStorage (clipboard) {
            expect(getArticles().length).toBe(1);
            expect(getArticles()[0].headline).toBe('Bananas are yellow');

            dragArticle({
                id: 'internal-code/content/first'
            }, clipboard, function () {
                dragArticle({
                    id: 'https://github.com/piuccio',
                    meta: {
                        headline: 'GitHub',
                        snapType: 'link'
                    }
                }, clipboard, testRemovingItems);
            });
        }

        function testRemovingItems (clipboard) {
            expect(getArticles().length).toBe(2);
            expect(getArticles()[0].headline).toBe('Bananas are yellow');
            expect(getArticles()[1].headline).toBe('GitHub');

            // Delete and item and check that it's not in storage anymore
            removeArticle({
                id: 'internal-code/content/first'
            }, clipboard, function () {
                injectClipboard(testLoadingAfterDelete);
            });
        }

        function testLoadingAfterDelete (clipboard) {
            expect(getArticles().length).toBe(1);
            expect(getArticles()[0].headline).toBe('GitHub');

            changeHeadline(0, 'Open Source', clipboard);
            expect(getArticles()[0].headline).toBe('Open Source');

            injectClipboard(testChangingMetadata);
        }

        function testChangingMetadata () {
            expect(getArticles().length).toBe(1);
            expect(getArticles()[0].headline).toBe('Open Source');

            done();
        }

        injectClipboard(testDraggingAnArticle);
    });
});

var container;
function injectClipboard (callback) {
    if (container) {
        ko.cleanNode(container[0]);
        container.remove();
        jasmine.clock().tick(10);
    }

    container = $([
        '<div>',
            '<clipboard-widget params="position: 0, column: $data"></clipboard-widget>',
        '</div>',
        '<script type="text/html" id="template_article">',
            '<div class="article" data-bind="text: headline"></div>',
        '</script>'
    ].join('')).appendTo(document.body);

    mediator.once('clipboard:loaded', function (clipboard) {
        yeld(function () {
            callback(clipboard);
        }, 10);
    });

    ko.applyBindings({
        isPasteActive: false
    }, container[0]);
    jasmine.clock().tick(10);
}

function getArticles () {
    var articles = [];
    $('.article').each(function (i, elem) {
        articles.push({
            headline: $(elem).text().trim(),
            dom: $(elem)
        });
    });
    return articles;
}

function dragArticle (article, clipboard, callback) {
    clipboard.group.drop({
        sourceItem: article,
    }, clipboard.group);
    // Let knockout refresh the HTML
    yeld(function () {
        jasmine.clock().tick(vars.CONST.detectPendingChangesInClipboard);
        callback(clipboard);
    }, 10);
}

function removeArticle (article, clipboard, callback) {
    var actualArticle = _.find(clipboard.group.items(), function (item) {
        return item.id() === article.id;
    });
    clipboard.group.omitItem(actualArticle);
    yeld(function () {
        jasmine.clock().tick(vars.CONST.detectPendingChangesInClipboard);
        callback(clipboard);
    }, 10);
}

function changeHeadline (position, newHeadline, clipboard) {
    var article = clipboard.group.items()[position];
    article.meta.headline(newHeadline);
    jasmine.clock().tick(vars.CONST.detectPendingChangesInClipboard);
}

var mockjaxId;
function setUpTests () {
    window.localStorage.clear();
    widgets.register();
    listManager.init(newItems);
    cache.put('contentApi', 'internal-code/content/first', {
        'webUrl': 'http://theguardian.com/banana',
        'fields': {
            'headline': 'Bananas are yellow'
        }
    });
    if (!vars.model) {
        vars.model = {
            switches: ko.observable({
                'facia-tool-sparklines': false
            })
        };
    }
    mockjaxId = mockjax({
        url: '/api/proxy/piuccio*',
        responseText: {}
    });
}

function clearTests () {
    listManager.reset();
    ko.cleanNode(container[0]);
    container.remove();
    mockjax.clear(mockjaxId);
}
