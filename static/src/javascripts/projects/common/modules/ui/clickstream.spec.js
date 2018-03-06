import bean from 'bean';
import mediator from 'lib/mediator';
import { initClickstream } from 'common/modules/ui/clickstream';

jest.mock('lib/mediator');

describe('Clickstream', () => {
    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML =
                '<div data-link-name="outer div">' +
                '<p id="not-inside-a-link">' +
                '<a href="/foo" id="click-me" data-link-name="the link">The link</a>' +
                '<a href="/foo" id="click-me-ancestor" data-link-name="the ancestor">' +
                '<span>' +
                '<span>' +
                '<span id="click-me-descendant" data-link-name="the descendant">The link descendant</span>' +
                '</span>' +
                '</span>' +
                '</a>' +
                '<a href="/foo" id="click-me-quick" data-is-ajax="true" data-link-name="xhr link">Xhr Link</a>' +
                '<button id="click-me-button" data-link-name="the button">Span Link</button>' +
                '<p href="#hello" id="click-me-slow" data-link-name="paragraph">Paragraph Link</p>' +
                '<a href="/foo" id="click-me-internal" data-link-name="internal link">Same-host link</a>' +
                '<a href="http://www.theguardian.com/foo" id="click-me-internal-http" data-link-name="internal link (HTTP)">Same-host HTTP link</a>' +
                '<a href="https://www.theguardian.com/foo" id="click-me-internal-https" data-link-name="internal link (HTTPS)">Same-host HTTPS link</a>' +
                '<a href="http://google.com/foo" id="click-me-external" data-link-name="external link">Other-host link</a>' +
                '<span data-link-context="the outer context">' +
                '<span data-link-context-path="the inner context path" data-link-context-name="the inner context name">' +
                '<button href="/foo" id="click-me-link-context" data-link-name="the contextual link">The link</button>' +
                '</span>' +
                '</span>' +
                '<div data-custom-event-properties=\'{ "prop1": "foo" }\'>' +
                '<button id="click-me-custom-event-properties" data-custom-event-properties=\'{ "prop2": "foo" }\'>Button</button>' +
                '</div>' +
                '</p>' +
                '</div>';
        }
    });

    afterEach(() => {
        bean.remove(document.body, 'click');
        mediator.removeEvent('module:clickstream:click');
    });

    const buildClickspecInspector = (expectedClickSpec, callback) =>
        clickSpec => {
            for (let prop in expectedClickSpec) {
                if (expectedClickSpec.hasOwnProperty(prop)) {
                    expect(clickSpec[prop]).toEqual(expectedClickSpec[prop]);
                }
            }
            callback();
        };

    it('should report the ancestor \'clickable\' element, not the element that actually received the click', done => {
        initClickstream({ filter: ['a'] });

        const el = document.getElementById('click-me-descendant');
        const expectedClickSpec = {
            samePage: false,
            sameHost: true,
            validTarget: true,
            tag: 'outer div | the ancestor | the descendant',
            tags: ['outer div','the ancestor','the descendant'],
            customEventProperties: {},
        };

        mediator.on('module:clickstream:click', buildClickspecInspector(expectedClickSpec, done));
        bean.fire(el, 'click');
    });

    it('should return clickspec with false validTarget when clicked element is *not* in the filter list of given element sources', done => {
        initClickstream({ filter: ['a'] });

        const el = document.getElementById('not-inside-a-link');
        const expectedClickSpec = {
            validTarget: false,
            tag: 'outer div',
            tags: ['outer div'],
            customEventProperties: {}
        };

        mediator.on('module:clickstream:click', buildClickspecInspector(expectedClickSpec, done));
        bean.fire(el, 'click');
    });

    it('should indicate if a click emanates from a internal anchor', done => {
        initClickstream({ filter: ['p'] });

        const el = document.getElementById('click-me-slow');
        const expectedClickSpec = {
            samePage: true,
            sameHost: true,
            validTarget: true,
            tag: 'outer div | paragraph',
            tags: ['outer div','paragraph'],
            customEventProperties: {}
        };

        mediator.on('module:clickstream:click', buildClickspecInspector(expectedClickSpec, done));
        bean.fire(el, 'click');
    });

    it('should indicate if a click emanates from a same-host link', done => {
        initClickstream({ filter: ['a'] });

        const el = document.getElementById('click-me-internal');
        const expectedClickSpec = {
            samePage: false,
            sameHost: true,
            validTarget: true,
            tag: 'outer div | internal link',
            tags: ['outer div', 'internal link'],
            customEventProperties: {}
        };

        mediator.on('module:clickstream:click', buildClickspecInspector(expectedClickSpec, done));
        bean.fire(el, 'click');
    });

    it('should indicate if a click emanates from an absolute same-host HTTP link when the current page is on HTTPS', done => {
        initClickstream({ filter: ['a'], location: { protocol: 'https:', hostname: 'www.theguardian.com' } });

        const el = document.getElementById('click-me-internal-http');
        const expectedClickSpec = {
            samePage: false,
            sameHost: true,
            validTarget: true,
            tag: 'outer div | internal link (HTTP)',
            tags: ['outer div', 'internal link (HTTP)'],
            customEventProperties: {}
        };

        mediator.on('module:clickstream:click', buildClickspecInspector(expectedClickSpec, done));
        bean.fire(el, 'click');
    });

    it('should indicate if a click emanates from an absolute same-host HTTPS link when the current page is on HTTP', done => {
        initClickstream({ filter: ['a'], location: { protocol: 'http:', hostname: 'www.theguardian.com' } });

        const el = document.getElementById('click-me-internal-https');
        const expectedClickSpec = {
            samePage: false,
            sameHost: true,
            validTarget: true,
            tag: 'outer div | internal link (HTTPS)',
            tags: ['outer div', 'internal link (HTTPS)'],
            customEventProperties: {}
        };

        mediator.on('module:clickstream:click', buildClickspecInspector(expectedClickSpec, done));
        bean.fire(el, 'click');
    });

    it('should indicate if a click emanates from an other-host link', done => {
        initClickstream({ filter: ['a'] });

        const el = document.getElementById('click-me-external');
        const expectedClickSpec = {
            samePage: false,
            sameHost: false,
            validTarget: true,
            tag: 'outer div | external link',
            tags: ['outer div', 'external link'],
            customEventProperties: {}
        };

        mediator.on('module:clickstream:click', buildClickspecInspector(expectedClickSpec, done));
        bean.fire(el, 'click');
    });

    it('should pick up the closest data-link-context attribute (only)', done => {
        initClickstream({ filter: ['button'] });

        const el = document.getElementById('click-me-link-context');
        const expectedClickSpec = {
            samePage: true,
            sameHost: true,
            validTarget: true,
            tag: 'outer div | the contextual link',
            tags: ['outer div', 'the contextual link'],
            linkContextPath: 'the inner context path',
            linkContextName: 'the inner context name',
            customEventProperties: {}
        };

        mediator.on('module:clickstream:click', buildClickspecInspector(expectedClickSpec, done));
        bean.fire(el, 'click');
    });

    it('should get custom event properties recursively', done => {
        initClickstream({ filter: ['button'] });

        const el = document.getElementById('click-me-custom-event-properties');
        const expectedClickSpec = {
            tag: 'outer div',
            tags: ['outer div'],
            samePage: true,
            sameHost: true,
            validTarget: true,
            customEventProperties: { 'prop1': 'foo', 'prop2': 'foo' }
        };

        mediator.on('module:clickstream:click', buildClickspecInspector(expectedClickSpec, done));
        bean.fire(el, 'click');
    });
});

