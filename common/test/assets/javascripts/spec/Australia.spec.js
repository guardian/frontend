define(['modules/navigation/australia', "common", "bean", 'modules/userPrefs', 'helpers/fixtures'], function(Australia, common, bean, userPrefs, fixtures) {

    describe('Australia', function() {

        var tmp = '<a class="au-test nav__link edition edition-au" data-link-name="switch to au edition" href="#au-link">AUS edition</a>';
        tmp += ' <a class="au-test nav__link edition" data-link-name="switch to us edition" href="#edition-switch">US edition</a>';

        var ausLink,
            editionSwitch;

        beforeEach(function() {
            localStorage.clear();
            fixtures.render({
                id: 'australia',
                fixtures: [tmp]
            });
            common.$g('.au-test').each(function(link){
                bean.add(link, 'click', function(e) {
                    e.preventDefault();
                });
            });
            ausLink = document.querySelector(".edition-au");
            editionSwitch = document.querySelector(".edition:not(.edition-au)");
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
