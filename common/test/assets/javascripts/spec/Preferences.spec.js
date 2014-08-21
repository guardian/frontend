define([
    'common/utils/preferences'
], function(
    preferences
) {

    describe('Preferences', function() {
        
        it('should not consider the user opted in if there is no GU_VIEW cookie', function() {
            document.cookie = "";
            expect(preferences.hasOptedIntoResponsive()).toBeFalsy();
        });

        it('should not consider the user opted if the user prefers the desktop site', function() {
            document.cookie = "GU_VIEW=desktop; expires=Fri, 3 Aug 2050 20:47:11 UTC; path=/";
            expect(preferences.hasOptedIntoResponsive()).toBeFalsy();

            document.cookie = "GU_VIEW=classic; expires=Fri, 3 Aug 2050 20:47:11 UTC; path=/";
            expect(preferences.hasOptedIntoResponsive()).toBeFalsy();
        });

        it('should consider the user opted in if the user prefers the responsive site', function() {
            document.cookie = "GU_VIEW=responsive; expires=Fri, 3 Aug 2050 20:47:11 UTC; path=/";
            expect(preferences.hasOptedIntoResponsive()).toBeTruthy();

            document.cookie = "GU_VIEW=mobile; expires=Fri, 3 Aug 2050 20:47:11 UTC; path=/";
            expect(preferences.hasOptedIntoResponsive()).toBeTruthy();
        });
    });

});