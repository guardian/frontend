define(['modules/navigation/platform-switch', 'modules/cookies', 'common', 'bean'],
    function(PlatformSwitch, Cookies, common, bean) {

    describe('Platform switch', function() {


        beforeEach(function() {
            Cookies.cleanUp(['GU_VIEW']);

            common.$g('.js-main-site-link').each(function(link){
                bean.add(link, 'click', function(e) {
                    e.preventDefault();
                });
            });

            new PlatformSwitch();
        });

        it('should set the "view" cookie when switching to desktop view', function() {
            var platformLink = document.querySelector(".js-main-site-link");

            expect(document.cookie).not.toMatch(/GU_VIEW=desktop/);

            bean.fire(platformLink, "click");

            expect(document.cookie).toMatch(/GU_VIEW=desktop/);
        });


    });
});
