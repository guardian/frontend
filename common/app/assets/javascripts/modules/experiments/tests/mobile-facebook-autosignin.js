define([
    "modules/detect",
    "modules/identity/autosignin",
    "modules/analytics/identity"],
 function(
   Detect,
   AutoSignin
 ){
     var MobileFacebookAutosigninTest = function() {

         var _config;
         this.id = 'MobileFacebookAutosignin';
         this.expiry = '2013-11-30';
         this.audience = 0.2;
         this.description = 'Performs an facebook autosignin on mobile where the user has alreadyg accepted the guardian facebook app';
         this.canRun = function(config) {
             return config.switches && config.switches.facebookAutosignin && Detect.getLayoutMode() === 'mobile';
         };
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
                     new AutoSignin(_config).init();
                 }

             }
         ];
     };

     return MobileFacebookAutosigninTest;
});