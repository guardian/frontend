define(['analytics/clickstream', 'bean', 'common'], function(Clickstream, bean, common) {

    describe("Clickstream", function() {

        // prevents unit tests from visiting the link
        bean.add(document.getElementById('click-me'), 'click', function(e) {
            e.preventDefault();
        })

        bean.add(document.getElementById('click-me-ancestor'), 'click', function(e) {
            e.preventDefault();
        })

        bean.add(document.getElementById('click-me-descendant'), 'click', function(e) {
            e.preventDefault();
        })

        bean.add(document.getElementById('click-me-quick'), 'click', function(e) {
            e.preventDefault();
        })

        bean.add(document.getElementById('click-me-internal'), 'click', function(e) {
            e.preventDefault();
        })

        bean.add(document.getElementById('click-me-external'), 'click', function(e) {
            e.preventDefault();
        })

        beforeEach(function(){

            // ensure each instance of Clickstream has a fresh <body>
            bean.remove(document.body, 'click');

            // clean listeners before each test
            var a = common.mediator.removeEvent('module:clickstream:click');

        });

        it("should derive analytics tag name from the dom ancestors of the source element", function(){

            var cs  = new Clickstream({ filter: ["button"] }),
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

            var cs  = new Clickstream({ filter: ["a"] }),
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

            var cs  = new Clickstream({ filter: ['a'] }), // only log events on [a]nchor elements
                object = { method: function (tag) {} },
                spy = sinon.spy(object, "method");

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(document.getElementById('not-inside-a-link'), 'click');

            runs(function(){
                expect(spy.callCount).toBe(0);
            });

        });

        it("should indicate if a click emanates from a internal anchor", function(){

            var cs  = new Clickstream({ filter: ["p"] }),
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

            var cs  = new Clickstream({ filter: ["a"] }),
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

            var cs  = new Clickstream({ filter: ["a"] }),
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



    });

});

