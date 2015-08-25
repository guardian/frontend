import testConfig from 'test-config';
import MockConfig from 'mock/config';
import MockSwitches from 'mock/switches';
import MockCollections from 'mock/collection';
import fixCollections from 'test/fixtures/some-collections';
import MockSearch from 'mock/search';
import MockLastModified from 'mock/lastmodified';
import fixArticles from 'test/fixtures/articles';
import verticalLayout from 'views/templates/vertical_layout.scala.html!text';
import mainLayout from 'views/templates/main.scala.html!text';
import Router from 'modules/router';
import handlers from 'modules/route-handlers';
import clone from 'utils/clean-clone';
import 'widgets/collection.html!text';
import inject from 'test/utils/inject';
import fakePushState from 'test/utils/push-state';
import * as wait from 'test/utils/wait';

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
            ${mainLayout}
        `);
        this.router = new Router(handlers, {
            pathname: '/test',
            search: '?layout=latest,front:uk'
        }, {
            pushState: (...args) => fakePushState.call(this.router.location, ...args)
        });
    }

    load() {
        this.baseModule = this.router.load(clone(testConfig));
        this.ko.apply(this.baseModule);
        return this.baseModule.loaded
            .then(() => wait.event('latest:loaded'))
            .then(() => wait.ms(10));
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
