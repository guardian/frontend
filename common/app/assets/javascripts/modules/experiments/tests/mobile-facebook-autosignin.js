define([
    "modules/utils/detect",
    "modules/identity/autosignin"],
 function(
   Detect,
   AutoSignin
 ){
     var MobileFacebookAutosigninTest = function() {

         var _config;
         this.id = 'MobileFacebookAutosignin';
         this.expiry = '2013-12-06';
         this.audience = 0.2;
         this.description = 'Performs an facebook autosignin on mobile where the user has alreadyg accepted the guardian facebook app';
         this.canRun = function(config) {
             return config.switches && config.switches.facebookAutosignin && Detect.getLa0youtMode() === 'mobile';
         };
         this.variants = [
             {
                 id: 'control',
                 test: function(context) {
                    return true;
                 }
             },
             {
                 id: 'auto-signin',
                 test: function() {
                     new AutoSignin(_config).init();
                 }
             }
         ];
     };

     return MobileFacebookAutosigninTest;
});