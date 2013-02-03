define(['analytics/clickstream', 'bean', 'common'], function(Clickstream, bean, common) {

    describe("Clickstream", function() {

        // prevents unit tests from visiting the link
        bean.add(document.getElementById('click-me'), 'click', function(e) {
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
                el = document.getElementById('click-me-button');

            spy.withArgs([el, 'outer div | the button', false, false]);

            common.mediator.on('module:clickstream:click', spy);
            common.mediator.on('module:clickstream:click', function(){ console.log(arguments); });

            bean.fire(el, 'click');

            runs(function(){
                expect(spy.withArgs([el, 'outer div | the button', true, true])).toHaveBeenCalledOnce();
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

        it("should indicate if a click emanates from an XmlHttpRequest source", function(){

            var cs  = new Clickstream({ filter: ["a"] }),
                object = { method: function (p) {} },
                spy = sinon.spy(object, "method"),
                el = document.getElementById('click-me-quick');

            spy.withArgs(["outer div | xhr link", true]);

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');

            runs(function(){
                expect(spy.withArgs([el, 'outer div | xhr link', true, true])).toHaveBeenCalledOnce();
                expect(spy).toHaveBeenCalledOnce();
            });
        });

        it("should indicate if a click emanates from a internal anchor", function(){

            var cs  = new Clickstream({ filter: ["p"] }),
                object = { method: function (p) {} },
                spy = sinon.spy(object, "method"),
                el = document.getElementById('click-me-slow');

            spy.withArgs(["outer div | parapraph", false, true]);

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');

            runs(function(){
                expect(spy.withArgs([el, 'outer div | paragraph', true, true])).toHaveBeenCalledOnce();
                expect(spy).toHaveBeenCalledOnce();
            });
        });

        it("should indicate if a click emanates from a same-host link", function(){

            var cs  = new Clickstream({ filter: ["a"] }),
                object = { method: function (p) {} },
                spy = sinon.spy(object, "method"),
                el = document.getElementById('click-me-internal');

            spy.withArgs(["outer div | internal link", false, true]);

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');

            runs(function(){
                expect(spy.withArgs([el, 'outer div | internal link', false, true])).toHaveBeenCalledOnce();
                expect(spy).toHaveBeenCalledOnce();
            });
        });

        it("should indicate if a click emanates from an other-host link", function(){

            var cs  = new Clickstream({ filter: ["a"] }),
                object = { method: function (p) {} },
                spy = sinon.spy(object, "method"),
                el = document.getElementById('click-me-external');

            spy.withArgs(["outer div | external link", false, true]);

            common.mediator.on('module:clickstream:click', spy);

            bean.fire(el, 'click');

            runs(function(){
                expect(spy.withArgs([el, 'outer div | external link', false, false])).toHaveBeenCalledOnce();
                expect(spy).toHaveBeenCalledOnce();
            });
        });



    });

});

