define(['common', 'bean', 'modules/autoupdate'], function(common, bean, Autoupdate) {

    describe("Auto update", function() {

        var callback,
            delay,
            path,
            attachTo;

        //Have to stub the global guardian object
        window.guardian = {
            userPrefs : {
                set : function() { return true; },
                get : sinon.spy(function(){})
            }
        };

        beforeEach(function() {
            window.localStorage['gu.prefs.auto-update'] = 'on';
            path = 'fixtures/autoupdate',
            delay = 1000,
            attachTo = document.getElementById('update-area');
            callback = sinon.spy(function(){});
        });

        afterEach(function() { callback = null });

        // json test needs to be run asynchronously
        it("should request the feed and attach response to the dom", function(){
            common.mediator.on('modules:autoupdate:loaded', callback);

            var a = new Autoupdate({
                    path: path,
                    delay: delay,
                    attachTo: attachTo,
                    switches: {autoRefresh: true}
                });
                a.init();

            waits(2000);

            runs(function(){
                expect(callback).toHaveBeenCalled();
                expect(attachTo.innerHTML).toBe('<span>foo</span>');
            });
        });


        it("should get user prefs from local storage ", function(){
            window.localStorage['gu.prefs.auto-update'] = 'off';

            var a = new Autoupdate({
                    path: path,
                    delay: delay,
                    attachTo: attachTo,
                    switches: {autoRefresh: true}
                });

            a.init();

            waits(2000);

            runs(function(){
                 var off = common.$g('[data-action="off"]').hasClass('is-active');
                 expect(off).toBe(true);
            });
        });

        xit("should destroy itself if server sends turn off response", function() {
            common.mediator.on('modules:autoupdate:destroyed', callback);

            var a = new Autoupdate({
                    path: 'fixtures/badupdate',
                    delay: delay,
                    attachTo: attachTo,
                    switches: {autoRefresh: true}
                });
                a.init();

            waits(2000);

            runs(function(){
                expect(callback).toHaveBeenCalled();
            });
        });
        
        xit('should not poll if `autoRefresh` switch turned off (default)', function() {
            common.mediator.on('modules:autoupdate:destroyed', callback);
            
            var a = new Autoupdate({
                    path:path,
                    delay:delay,
                    attachTo: attachTo
                });
                a.init();

            waits(2000);

            runs(function(){
                expect(callback).not.toHaveBeenCalled();
            });
        });
       
    });
});