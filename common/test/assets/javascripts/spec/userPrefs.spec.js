define(['common', 'modules/userPrefs'], function(common, userPrefs) {

    var userPrefKeyPrefix = 'gu.prefs';

    describe("userPrefs - Client-side preferences", function() {
   
        beforeEach(function() {
            localStorage.clear()
            userPrefs.set('key', 'value');
        })

        it("should store a user preference under a given key", function () {
            expect(localStorage.getItem('gu.prefs.key')).toBe('value|string')
        })
        
        it("should retrieve a user preference under a given key", function () {
            expect(userPrefs.get('key')).toBe('value')
        })
        
        it("should remove a user preference under a given key", function () {
            userPrefs.remove('key');
            expect(userPrefs.get('key')).toBeNull()
        })
        
        xit("should allow setting of preferences via the querystring", function() {
        })
        
    });

    describe("userPrefs - Switch overrides", function() {
        
        beforeEach(function() {
            localStorage.clear()
        })
        
        it("should store a switch value", function () {
            userPrefs.switchOn('s')
            expect(localStorage.getItem('gu.prefs.switch.s')).toBe('true|boolean')
            expect(userPrefs.isOn('s')).toBeTruthy();
        })
        
        it("should retrieve a user preference under a given key", function () {
            userPrefs.switchOff('s')
            expect(localStorage.getItem('gu.prefs.switch.s')).toBe('false|boolean')
            expect(userPrefs.isOn('s')).toBeFalsy();
            expect(userPrefs.isOff('s')).toBeTruthy();
        })
        
        it("should remove a user preference under a given key", function () {
            userPrefs.removeSwitch('s');
            expect(userPrefs.get('s')).toBeNull()
        })
        
        xit("should stub localStorage so that code can not remove localStorage date (accidentally)", function(){})
        xit("", function(){})
        xit("", function(){})
        xit("", function(){})


    })

})
