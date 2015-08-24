import testConfig from 'test-config';
import MockConfig from 'mock/config';
import Router from 'modules/router';
import handlers from 'modules/route-handlers';
import clone from 'utils/clean-clone';
import verticalLayout from 'views/templates/vertical_layout.scala.html!text';
import mainLayout from 'views/templates/main.scala.html!text';
import MockSwitches from 'mock/switches';
import MockCollection from 'mock/collection';
import MockDefaults from 'mock/defaults';
import fakePushState from 'test/utils/push-state';
import inject from 'test/utils/inject';

export default class Loader {
    constructor() {
        var mockConfig, mockSwitches, mockCollection, mockDefaults;

        mockConfig = new MockConfig();
        mockConfig.set(testConfig.config);
        mockSwitches = new MockSwitches();
        mockSwitches.set(testConfig.switches);
        mockCollection = new MockCollection();
        mockDefaults = new MockDefaults();
        mockDefaults.set(testConfig.defaults);

        this.mockConfig = mockConfig;
        this.mockSwitches = mockSwitches;
        this.mockCollection = mockCollection;
        this.mockDefaults = mockDefaults;

        this.ko = inject(`
            ${verticalLayout}
            ${mainLayout}
        `);
        this.router = new Router(handlers, {
            pathname: '/test/config',
            search: ''
        }, {
            pushState: (...args) => fakePushState.call(this.router.location, ...args)
        });
    }

    load() {
        this.baseModule = this.router.load(clone(testConfig));
        this.ko.apply(this.baseModule);
        return this.baseModule.loaded;
    }

    dispose() {
        this.ko.dispose();
        this.mockConfig.dispose();
        this.mockSwitches.dispose();
        this.mockCollection.dispose();
        this.mockDefaults.dispose();
    }
}
