/* eslint-disable no-use-before-define */
define(['common/modules/ui/clickstream', 'bean', 'common/utils/mediator', 'helpers/fixtures'], function (Clickstream, bean, mediator, fixtures) {

    describe('Clickstream', function () {
        var fixtureId = 'clickstream-fixture',
        clickIds = ['click-me', 'click-me-ancestor', 'click-me-descendant', 'click-me-quick', 'click-me-internal', 'click-me-external'];

        beforeEach(function () {

            fixtures.render(
                {
                    id: fixtureId,
                    fixtures:
                        ['<div data-link-name="outer div">' +
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
                        '</div>'
                        ]
                }
            );

            clickIds.forEach(function (id) {
                // prevents unit tests from visiting the link
                bean.on(document.getElementById(id), 'click', function (e) {
                    e.preventDefault();
                });
            });

        });

        afterEach(function () {
            // remove events anf fixture
            clickIds.forEach(function (id) {
                bean.off(document.getElementById(id), 'click');
            });
            fixtures.clean(fixtureId);

            // ensure each instance of Clickstream has a fresh <body>
            bean.remove(document.body, 'click');

            // clean listeners
            mediator.removeEvent('module:clickstream:click');
        });

        it('should report the ancestor \'clickable\' element, not the element that actually received the click', function (done) {

            new Clickstream({ filter: ['a'], withEvent: false });

            var object = { method: function (p) {
                    clickSpec.target = p.target;
                    expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
                    done();
                }},
                spy = sinon.spy(object, 'method'),
                el = document.getElementById('click-me-descendant'),
                clickSpec = {
                    samePage: false,
                    sameHost: true,
                    validTarget: true,
                    tag: 'outer div | the ancestor | the descendant',
                    customEventProperties: {}
                };

            mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');
        });

        it('should return clickspec with false validTarget when clicked element is *not* in the filter list of given element sources', function (done) {

            new Clickstream({ filter: ['a'], withEvent: false }); // only log events on [a]nchor elements

            var object = { method: function (p) {
                    clickSpec.target = p.target;
                    expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
                    done();
                }},
                spy = sinon.spy(object, 'method'),
                clickSpec = {
                    validTarget: false,
                    tag: 'outer div',
                    customEventProperties: {}
                };

            mediator.on('module:clickstream:click', spy);

            bean.fire(document.getElementById('not-inside-a-link'), 'click');
        });

        it('should indicate if a click emanates from a internal anchor', function (done) {

            new Clickstream({ filter: ['p'], withEvent: false });

            var object = { method: function (p) {
                    clickSpec.target = p.target;
                    expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
                    done();
                }},
                spy = sinon.spy(object, 'method'),
                el = document.getElementById('click-me-slow'),
                clickSpec = {
                    samePage: true,
                    sameHost: true,
                    validTarget: true,
                    tag: 'outer div | paragraph',
                    customEventProperties: {}
                };

            mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');
        });

        it('should indicate if a click emanates from a same-host link', function (done) {

            new Clickstream({ filter: ['a'], withEvent: false });

            var object = { method: function (p) {
                    clickSpec.target = p.target;
                    expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
                    done();
                }},
                spy = sinon.spy(object, 'method'),
                el = document.getElementById('click-me-internal'),
                clickSpec = {
                    samePage: false,
                    sameHost: true,
                    validTarget: true,
                    tag: 'outer div | internal link',
                    customEventProperties: {}
                };

            mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');
        });

        it('should indicate if a click emanates from an other-host link', function (done) {

            new Clickstream({ filter: ['a'], withEvent: false });

            var object = { method: function (p) {
                    clickSpec.target = p.target;
                    expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
                    done();
                }},
                spy = sinon.spy(object, 'method'),
                el = document.getElementById('click-me-external'),
                clickSpec = {
                    samePage: false,
                    sameHost: false,
                    validTarget: true,
                    tag: 'outer div | external link',
                    customEventProperties: {}
                };

            mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');
        });

        it('should not fire clicks when instantiated without the listener', function () {

            new Clickstream({ filter: ['a'], addListener: false, withEvent: false }); // disable the listener on the body

            var object = { method: function () {} },
                spy = sinon.spy(object, 'method');

            mediator.on('module:clickstream:click', spy);

            bean.fire(document.getElementById('click-me'), 'click');

            expect(spy.callCount).toBe(0);

        });

        it('should pick up the closest data-link-context attribute (only)', function (done) {

            new Clickstream({ filter: ['button'], withEvent: false });

            var object = { method: function (p) {
                    clickSpec.target = p.target;
                    expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
                    done();
                }},
                spy = sinon.spy(object, 'method'),
                el = document.getElementById('click-me-link-context'),
                clickSpec = {
                    samePage: true,
                    sameHost: true,
                    validTarget: true,
                    tag: 'outer div | the contextual link',
                    linkContextPath: 'the inner context path',
                    linkContextName: 'the inner context name',
                    customEventProperties: {}
                };

            mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');
        });

        it('should get custom event properties recursively', function (done) {
            new Clickstream({ filter: ['button'], withEvent: false });

            var spy = sinon.spy({ method: function (p) {
                var clickSpec = {
                    tag: 'outer div',
                    samePage: true,
                    sameHost: true,
                    validTarget: true,
                    customEventProperties: { 'prop1': 'foo', 'prop2': 'foo' }
                };
                clickSpec.target = p.target;
                expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
                done();
            } }, 'method');
            mediator.on('module:clickstream:click', spy);

            var el = document.getElementById('click-me-custom-event-properties');
            bean.fire(el, 'click');
        });
    });

});

