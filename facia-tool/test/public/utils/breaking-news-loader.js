import verticalLayout from 'views/templates/vertical_layout.scala.html!text';
import mainLayout from 'views/templates/main.scala.html!text';
import fixArticles from 'test/fixtures/articles';
import MockCollections from 'mock/collection';
import testConfig from 'test/fixtures/breaking-news-test-config';
import MockConfig from 'mock/config';
import MockSearch from 'mock/search';
import MockSwitches from 'mock/switches';
import MockLastModified from 'mock/lastmodified';
import Router from 'modules/router';
import handlers from 'modules/route-handlers';
import fakePushState from 'test/utils/push-state';
import inject from 'test/utils/inject';
import * as wait from 'test/utils/wait';

export default class Loader {
    constructor(scope, done) {
        scope.ko = inject(`
            ${verticalLayout}
            ${mainLayout}
        `);
        scope.router = new Router(handlers, {
            pathname: '/editorial',
            search: '?layout=latest,front:breaking-news'
        }, {
            pushState: (...args) => fakePushState.call(scope.router.location, ...args)
        });
        scope.testConfig = testConfig;
        scope.mockCollections = new MockCollections();
        scope.mockCollections.set({});
        scope.mockConfig = new MockConfig();
        scope.mockConfig.set(testConfig.config);
        scope.mockSwitches = new MockSwitches();
        scope.mockSwitches.set(testConfig.switches);
        scope.mockSearch = new MockSearch();
        scope.mockSearch.set(fixArticles.articlesData);
        scope.mockSearch.latest(fixArticles.allArticles);
        scope.mockLastModified = new MockLastModified();

        scope.baseModule = scope.router.load(testConfig);
        scope.ko.apply(scope.baseModule)
            .then(() => scope.baseModule.loaded)
            .then(() => wait.event('latest:loaded'))
            .then(() => wait.ms(10))
            .then(done)
            .catch(done.fail);
    }

    dispose(scope) {
        scope.ko.dispose();
        scope.mockCollections.dispose();
        scope.mockConfig.dispose();
        scope.mockSwitches.dispose();
        scope.mockSearch.dispose();
        scope.mockLastModified.dispose();
    }
}
