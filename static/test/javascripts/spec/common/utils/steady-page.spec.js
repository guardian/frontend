define([
    'bonzo',
    'common/utils/$',
    'common/utils/steady-page'
], function (
    bonzo,
    $,
    steadyPage
) {
    describe('Insert', function () {
        var container;
        var callbackFunc;

        beforeEach(function () {
            window.scrollY = 100;

            spyOn(window, 'scrollTo').andCallThrough();

            callbackFunc = function () {
                // The page will shift 100px
                container.scrollHeight = 100;
            }
        });

        it('should set the scroll top of body when insertion is above current scrollTop', function () {

            // Top of insertion container above scrollTop
            container = {
                offsetTop: 50
            };

            steadyPage.insert(container, callbackFunc);

            // Our scrolltop should be 200(px)
            expect(window.scrollTo).toHaveBeenCalledWith(0, 200);
        });
    });
});
