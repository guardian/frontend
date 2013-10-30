define([
    "modules/detect",
    "modules/identity/autosignin"],
 function(
   Detect,
   AutoSignin
 ){
     var MobileFacebookAutosigninTest = function() {

         this.id = 'MobileFacebookAutosignin';
         this.expiry = '2013-11-30';
         this.audience = 0.2;
         this.description = 'Performs an facebook autosignin on mobile where the user has alreadyg accepted the guardian facebook app';
         this.canRun = function(config) { return config.page ? true : false};
         this.variants = [
             {
                 id: 'control',
                 test: function(context) {
                    return true;
                 }
             },
             {
                 id: 'mobile-auto-facebook-signin',
                 test: function() {
                    if (Detect.getLayoutMode() === 'mobile') {
                       new AutoSignin(guardian.config).init();
                    }
                 }
             }
         ];
     };

     return MobileFacebookAutosigninTest;
});