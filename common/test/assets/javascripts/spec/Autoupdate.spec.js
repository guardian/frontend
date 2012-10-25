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
            path = 'fixtures/autoupdate',
            delay = 1000,
            attachTo = document.getElementById('update-area');
            callback = sinon.spy(function(){});
        });

        // json test needs to be run asynchronously
        it("should request the feed and attach response to the dom", function(){
            common.mediator.on('modules:autoupdate:loaded', callback);

            var a = new Autoupdate(path, delay, attachTo, {polling: true});
                a.init();

            waits(2000);

            runs(function(){
                expect(callback).toHaveBeenCalled();
                expect(attachTo.innerHTML).toBe('<span>foo</span>');
            });
        });


        it("should get user prefs from local storage ", function(){
            expect(window.guardian.userPrefs.get).toHaveBeenCalled();
        });

        it("should destroy itself if server sends turn off response", function() {
            common.mediator.on('modules:autoupdate:destroyed', callback);

            var a = new Autoupdate('fixtures/badupdate', delay, attachTo, {polling: true});
                a.init();

            waits(2000);

            runs(function(){
                expect(callback).toHaveBeenCalled();
            });
        });
        
        it('should not poll if `polling` switch turned off (default)', function() {
            common.mediator.on('modules:autoupdate:destroyed', callback);
            
            var a = new Autoupdate(path, delay, attachTo);
                a.init();

            waits(2000);

            runs(function(){
                expect(callback).not.toHaveBeenCalled();
            });
        });
       
    });
});