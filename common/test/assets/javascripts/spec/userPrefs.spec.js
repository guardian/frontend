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

        it("should allow setting of preferences via the address bar", function() {
          
            // string tests setting of prefs, switches of int, string, booleans
            var qs = { hash: '#gu.prefs.a=1&gu.prefs.b=false&gu.prefs.c=str&gu.prefs.switchOn=d&gu.prefs.switchOff=e' };
            
            userPrefs.setPrefs(qs);
            
            expect(userPrefs.get('a')).toBe(1) // int
            expect(userPrefs.get('b')).toBe(false) // bool
            expect(userPrefs.get('c')).toBe("str") // string
            expect(userPrefs.isOn('d')).toBeTruthy()
            expect(userPrefs.isOff('e')).toBeTruthy()
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

    })

})
