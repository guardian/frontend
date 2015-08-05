import testConfig from 'test-config';
import ConfigEditor from 'models/config/main';
import MockConfig from 'mock/config';
import MockSwitches from 'mock/switches';
import MockCollection from 'mock/collection';
import MockDefaults from 'mock/defaults';
import templateConfig from 'views/config.scala.html!text';
import Bootstrap from 'modules/bootstrap';
import inject from 'test/utils/inject';
import * as wait from 'test/utils/wait';
import * as vars from 'modules/vars';

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

        this.ko = inject(
            templateConfig
                .replace('@{priority}', 'test')
                .replace('@urlBase(env)', '/')
                .replace(/\@[^\n]+\n/g, '')
        );

        vars.priority = testConfig.defaults.priority;
    }

    load() {
        new ConfigEditor().init(new Bootstrap(), testConfig);
        vars.update(testConfig);
        // Wait for knockout to handle bindings
        return wait.ms(50);
    }

    dispose() {
        this.ko.dispose();
        this.mockConfig.dispose();
        this.mockSwitches.dispose();
        this.mockCollection.dispose();
        this.mockDefaults.dispose();
    }
}
