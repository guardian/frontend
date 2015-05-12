import _ from 'underscore';
import Promise from 'Promise';
import ConfigEditor from 'models/config/main';
import MockConfig from 'mock/config';
import fixConfig from 'test/fixtures/one-front-config';
import MockSwitches from 'mock/switches';
import fixSwitches from 'test/fixtures/default-switches';
import MockCollection from 'mock/collection';
import templateConfig from 'views/config.scala.html!text';

export default function () {
    var mockConfig, mockSwitches, mockCollection;

    var loader = new Promise (function (resolve) {
        mockConfig = new MockConfig();
        mockConfig.set(fixConfig);
        mockSwitches = new MockSwitches();
        mockSwitches.set(fixSwitches);
        mockCollection = new MockCollection();

        // The configuration tool is ready when config and switches are loaded
        var loaded = _.after(2, _.once(function () {
            resolve();
        }));
        mockConfig.once('complete', loaded);
        mockSwitches.once('complete', loaded);

        document.body.innerHTML += templateConfig
            .replace('@{priority}', 'test')
            .replace('@urlBase(env)', '/')
            .replace(/\@[^\n]+\n/g, '');

        // Mock the time
        jasmine.clock().install();
        new ConfigEditor().init();
        // There's a network request in the init to get the config, advance time
        jasmine.clock().tick(100);
    });

    function unload () {
        jasmine.clock().uninstall();
        var container = document.querySelector('.toolbar').parentNode;
        document.body.removeChild(container);
        mockConfig.dispose();
        mockSwitches.dispose();
        mockCollection.dispose();
    }

    return {
        loader,
        unload,
        mockConfig
    };
}
