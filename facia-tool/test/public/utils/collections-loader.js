import testConfig from 'test-config';
import _ from 'underscore';
import Promise from 'Promise';
import CollectionsEditor from 'models/collections/main';
import MockConfig from 'mock/config';
import MockSwitches from 'mock/switches';
import MockCollections from 'mock/collection';
import fixCollections from 'test/fixtures/some-collections';
import MockSearch from 'mock/search';
import fixArticles from 'test/fixtures/articles';
import * as layoutFromURL from 'utils/layout-from-url';
import templateCollections from 'views/collections.scala.html!text';
import verticalLayout from 'views/templates/vertical_layout.scala.html!text';
import mediator from 'utils/mediator';
import 'widgets/collection.html!text';
import tick from 'test/utils/tick';

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
        mockConfig.set(testConfig.config);
        mockSwitches = new MockSwitches();
        mockSwitches.set(testConfig.switches);
        mockCollections = new MockCollections();
        mockCollections.set(fixCollections);
        mockSearch = new MockSearch();
        mockSearch.set(fixArticles.articlesData);
        mockSearch.latest(fixArticles.allArticles);

        // Mock the time
        jasmine.clock().install();

        // After 2 because we are waiting for latest feed and front widget
        var pageLoaded = _.after(2, _.once(resolve));

        mediator.on('latest:loaded', pageLoaded);
        mockSearch.on('complete', pageLoaded);

        new CollectionsEditor().init({}, testConfig);

        // The first 3 ticks are for the 3 initial configuration requests
        tick(50).then(() => tick(50)).then(() => tick(50))
        // These 2 other ticks are for the article search and lastmodified
        .then(() => tick(50)).then(() => tick(50))
        // The remaining ticks are for the latest feed to load
        .then(() => tick(350)).then(() => tick(50));
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
