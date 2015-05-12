import _ from 'underscore';
import Promise from 'Promise';
import CollectionsEditor from 'models/collections/main';
import MockConfig from 'mock/config';
import fixConfig from 'test/fixtures/one-front-config';
import MockSwitches from 'mock/switches';
import fixSwitches from 'test/fixtures/default-switches';
import MockCollections from 'mock/collection';
import fixCollections from 'test/fixtures/some-collections';
import MockSearch from 'mock/search';
import fixArticles from 'test/fixtures/articles';
import * as layoutFromURL from 'utils/layout-from-url';
import templateCollections from 'views/collections.scala.html!text';
import verticalLayout from 'views/templates/vertical_layout.scala.html!text';
import mediator from 'utils/mediator';
import 'widgets/collection.html!text';

export default function() {
    var mockConfig, mockSwitches, mockCollections, mockSearch;

    var loader = new Promise(function (resolve) {
        document.body.innerHTML += '<div id="_test_container_collections">' +
            verticalLayout +
            templateCollections.replace(/\@[^\n]+\n/g, '') +
            '</div>';

        layoutFromURL.get = function () {
            return [{
                type: 'latest'
            }, {
                type: 'front',
                config: 'uk'
            }];
        };

        mockConfig = new MockConfig();
        mockConfig.set(fixConfig);
        mockSwitches = new MockSwitches();
        mockSwitches.set(fixSwitches);
        mockCollections = new MockCollections();
        mockCollections.set(fixCollections);
        mockSearch = new MockSearch();
        mockSearch.set(fixArticles.articlesData);
        mockSearch.latest(fixArticles.allArticles);

        // Mock the time
        var originalSetTimeout = window.setTimeout;
        jasmine.clock().install();

        mediator.on('latest:loaded', function () {
            // wait for the debounce (give some time to knockout to handle bindings)
            originalSetTimeout(function () {
                jasmine.clock().tick(350);
            }, 50);
        });


        new CollectionsEditor().init();

        // Number 2 is because we wait for two search, latest and the only
        // article in the collection.
        mockSearch.on('complete', _.after(2, _.once(function () {
            resolve();
        })));

        // The first tick is for the configuration to be loaded
        jasmine.clock().tick(100);
        // The second tick is for the collections to be leaded
        jasmine.clock().tick(300);

    });

    function unload () {
        jasmine.clock().uninstall();
        var container = document.getElementById('_test_container_collections');
        document.body.removeChild(container);
        mockConfig.dispose();
        mockSwitches.dispose();
        mockCollections.dispose();
        mockSearch.dispose();
    }

    return {
        loader,
        unload,
        mockCollections
    };
}
