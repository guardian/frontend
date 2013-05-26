define(['modules/navigation/australia', "common", "bean", 'modules/userPrefs'],
    function(Australia, common, bean, userPrefs) {

    describe('Australia', function() {

        var ausLink = document.querySelector(".edition-au");
        var editionSwitch = document.querySelector(".edition:not(.edition-au)");

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

        it('should set the australia pref if the aus edition link is clicked whilst in the UK edition', function() {
            var config = {
                page: {
                    edition: 'UK'
                }
            };

            new Australia(config);
            bean.fire(ausLink, "click");
            expect(userPrefs.isOn("australia-edition")).toBe(true);
        });

        it('should not set the australia pref if the aus edition link is whilst in the US edition', function() {
            var config = {
                page: {
                    edition: 'US'
                }
            };

            new Australia(config);
            bean.fire(ausLink, "click");
            expect(userPrefs.isOn("australia-edition")).toBe(false);
        });


        it('should turn off australia pref if another edition link is clicked ', function() {
            new Australia();
            bean.fire(ausLink, "click");
            bean.fire(editionSwitch, "click");
            expect(userPrefs.isOn("australia-edition")).toBe(false);
        });
    });
});
