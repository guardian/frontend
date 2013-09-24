define(['analytics/clickstream', 'bean', 'common', 'helpers/fixtures'], function(Clickstream, bean, common, fixtures) {

    var fixtureId = 'clickstream-fixture',
        clickIds = ['click-me', 'click-me-ancestor', 'click-me-descendant', 'click-me-quick', 'click-me-internal', 'click-me-external'];

    describe("Clickstream", function() {

        beforeEach(function(){

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
                                    '<span data-link-context="the inner context">' +
                                        '<button href="/foo" id="click-me-link-context" data-link-name="the contextual link">The link</button>' +
                                    '</span>' +
                                '</span>' +
                            '</p>' +
                        '</div>'
                        ]
                }
            );

            clickIds.forEach(function(id) {
                // prevents unit tests from visiting the link
                bean.on(document.getElementById(id), 'click', function(e) {
                    e.preventDefault();
                });
            });

        });

        afterEach(function() {
            // remove events anf fixture
            clickIds.forEach(function(id) {
                bean.off(document.getElementById(id), 'click');
            });
            fixtures.clean(fixtureId);

            // ensure each instance of Clickstream has a fresh <body>
            bean.remove(document.body, 'click');

            // clean listeners
            common.mediator.removeEvent('module:clickstream:click');
        });

        it("should derive analytics tag name from the dom ancestors of the source element", function(){

            var cs  = new Clickstream({ filter: ["button"], withEvent: false }),
                object = { method: function (p) {} },
                spy = sinon.spy(object, "method"),
                el = document.getElementById('click-me-button'),
                clickSpec = {
                    target: el,
                    samePage: true,
                    sameHost: true,
                    tag: 'outer div | the button'
                };

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');

            runs(function(){
                expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
            });

        });

        it("should report the ancestor 'clickable' element, not the element that actually received the click", function(){

            var cs  = new Clickstream({ filter: ["a"], withEvent: false }),
                object = { method: function (p) {} },
                spy = sinon.spy(object, "method"),
                el = document.getElementById('click-me-descendant'),
                elAncestor = document.getElementById('click-me-ancestor'),
                clickSpec = {
                    target: elAncestor,
                    samePage: false,
                    sameHost: true,
                    tag: 'outer div | the ancestor | the descendant'
                };

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');

            runs(function(){
                expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
            });

        });

        it("should ignore clicks *not* from a list of given element sources", function(){

            var cs  = new Clickstream({ filter: ['a'], withEvent: false }), // only log events on [a]nchor elements
                object = { method: function (tag) {} },
                spy = sinon.spy(object, "method");

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(document.getElementById('not-inside-a-link'), 'click');

            runs(function(){
                expect(spy.callCount).toBe(0);
            });

        });

        it("should indicate if a click emanates from a internal anchor", function(){

            var cs  = new Clickstream({ filter: ["p"], withEvent: false }),
                object = { method: function (p) {} },
                spy = sinon.spy(object, "method"),
                el = document.getElementById('click-me-slow'),
                clickSpec = {
                    target: el,
                    samePage: true,
                    sameHost: true,
                    tag: 'outer div | paragraph'
                };

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');

            runs(function(){
                expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
            });
        });

        it("should indicate if a click emanates from a same-host link", function(){

            var cs  = new Clickstream({ filter: ["a"], withEvent: false }),
                object = { method: function (p) {} },
                spy = sinon.spy(object, "method"),
                el = document.getElementById('click-me-internal'),
                clickSpec = {
                    target: el,
                    samePage: false,
                    sameHost: true,
                    tag: 'outer div | internal link'
                };

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');

            runs(function(){
                expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
            });
        });

        it("should indicate if a click emanates from an other-host link", function(){

            var cs  = new Clickstream({ filter: ["a"], withEvent: false }),
                object = { method: function (p) {} },
                spy = sinon.spy(object, "method"),
                el = document.getElementById('click-me-external'),
                clickSpec = {
                    target: el,
                    samePage: false,
                    sameHost: false,
                    tag: 'outer div | external link'
                };

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');

            runs(function(){
                expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
            });
        });

        it("should not fire clicks when instantiated without the listener", function(){

            var cs  = new Clickstream({ filter: ['a'], addListener: false, withEvent: false }), // disable the listener on the body
                object = { method: function (tag) {} },
                spy = sinon.spy(object, "method");

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(document.getElementById('click-me'), 'click');

            runs(function(){
                expect(spy.callCount).toBe(0);
            });

        });

        it("should pick up the closest data-link-context attribute (only)", function(){

            var cs  = new Clickstream({ filter: ['button'], withEvent: false }),
                object = { method: function (p) {} },
                spy = sinon.spy(object, "method"),
                el = document.getElementById('click-me-link-context'),
                clickSpec = {
                    target: el,
                    samePage: true,
                    sameHost: true,
                    tag: 'outer div | the contextual link',
                    linkContext: 'the inner context'
                };

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');

            runs(function(){
                expect(spy.withArgs(clickSpec)).toHaveBeenCalledOnce();
            });

        });

    });

});

