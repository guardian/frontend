import testConfig from 'test-config';
import Promise from 'Promise';
import ConfigEditor from 'models/config/main';
import MockConfig from 'mock/config';
import MockSwitches from 'mock/switches';
import MockCollection from 'mock/collection';
import MockDefaults from 'mock/defaults';
import templateConfig from 'views/config.scala.html!text';
import Bootstrap from 'modules/bootstrap';

export default function () {
    var mockConfig, mockSwitches, mockCollection, mockDefaults;

    var loader = new Promise (function (resolve) {
        mockConfig = new MockConfig();
        mockConfig.set(testConfig.config);
        mockSwitches = new MockSwitches();
        mockSwitches.set(testConfig.switches);
        mockCollection = new MockCollection();
        mockDefaults = new MockDefaults();
        mockDefaults.set(testConfig.defaults);

        document.body.innerHTML += templateConfig
            .replace('@{priority}', 'test')
            .replace('@urlBase(env)', '/')
            .replace(/\@[^\n]+\n/g, '');

        // Mock the time
        var originalSetTimeout = window.setTimeout;
        jasmine.clock().install();
        new ConfigEditor().init(new Bootstrap(), testConfig);
        // There's a network request in the init to get the config, advance time
        jasmine.clock().tick(100);

        // Wait for knockout to handle bindings
        originalSetTimeout(function () {
            resolve();
        }, 50);
    });

    function unload () {
        jasmine.clock().uninstall();
        var container = document.querySelector('.toolbar').parentNode;
        document.body.removeChild(container);
        mockConfig.dispose();
        mockSwitches.dispose();
        mockCollection.dispose();
        mockDefaults.dispose();
    }

    return {
        loader,
        unload,
        mockConfig
    };
}
