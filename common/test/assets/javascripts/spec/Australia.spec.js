define(['modules/navigation/australia', "common", "bean", 'modules/userPrefs'],
    function(Australia, common, bean, userPrefs) {
    
    describe('Australia', function() {

        var ausLink = document.querySelector("#au-link");
        var editionSwitch = document.querySelector("#edition-switch");

        beforeEach(function() {
            localStorage.clear();

            common.$g('.au-test').each(function(link){
                bean.add(link, 'click', function(e) {
                    e.preventDefault();
                });
            });
        });
        
        it('should exist', function() {
            expect(Australia).toBeDefined();
        });

        it('should set the australia pref if the aus edition link is clicked', function() {
            new Australia();
            bean.fire(ausLink, "click");
            expect(userPrefs.isOn("australia-edition")).toBe(true);
        });

        it('should turn off australia pref if another edition link is clicked ', function() {
            new Australia();
            bean.fire(ausLink, "click");
            bean.fire(editionSwitch, "click");
            expect(userPrefs.isOn("australia-edition")).toBe(false);
        });
    });
});
