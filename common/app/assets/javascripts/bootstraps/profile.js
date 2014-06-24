define([
    'common/modules/identity/public-profile'
], function(
    PublicProfile
) {
   function init() {
       PublicProfile.init();
   }
   return { init: init };
});
