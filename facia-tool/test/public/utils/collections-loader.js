import testConfig from 'test-config';
import CollectionsEditor from 'models/collections/main';
import MockConfig from 'mock/config';
import MockSwitches from 'mock/switches';
import MockCollections from 'mock/collection';
import fixCollections from 'test/fixtures/some-collections';
import MockSearch from 'mock/search';
import MockLastModified from 'mock/lastmodified';
import fixArticles from 'test/fixtures/articles';
import * as layoutFromURL from 'utils/layout-from-url';
import templateCollections from 'views/collections.scala.html!text';
import verticalLayout from 'views/templates/vertical_layout.scala.html!text';
import 'widgets/collection.html!text';
import inject from 'test/utils/inject';
import * as wait from 'test/utils/wait';
import * as vars from 'modules/vars';

export default class Loader {
    constructor() {
        var mockConfig, mockSwitches, mockCollections, mockSearch, mockLastModified;

        mockConfig = new MockConfig();
        mockConfig.set(testConfig.config);
        mockSwitches = new MockSwitches();
        mockSwitches.set(testConfig.switches);
        mockCollections = new MockCollections();
        mockCollections.set(fixCollections);
        mockSearch = new MockSearch();
        mockSearch.set(fixArticles.articlesData);
        mockSearch.latest(fixArticles.allArticles);
        mockLastModified = new MockLastModified();

        this.mockConfig = mockConfig;
        this.mockSwitches = mockSwitches;
        this.mockCollections = mockCollections;
        this.mockSearch = mockSearch;
        this.mockLastModified = mockLastModified;

        this.ko = inject(`
            ${verticalLayout}
            ${templateCollections.replace(/\@[^\n]+\n/g, '')}
        `);

        layoutFromURL.get = function () {
            return [{
                type: 'latest'
            }, {
                type: 'front',
                config: 'uk'
            }];
        };

        vars.priority = testConfig.defaults.priority;
    }

    load() {
        new CollectionsEditor().init({}, testConfig);
        vars.update(testConfig);
        return wait.event('latest:loaded');
    }

    dispose() {
        this.ko.dispose();
        this.mockConfig.dispose();
        this.mockSwitches.dispose();
        this.mockCollections.dispose();
        this.mockSearch.dispose();
        this.mockLastModified.dispose();
    }
}
