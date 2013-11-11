define([
    "modules/detect",
    "modules/identity/autosignin"],
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
             _config = config;
             return config.page ? true : false;
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
                     if ( _config.switches && _config.switches.facebookAutosignin && Detect.getLayoutMode() === 'mobile') {
                         new AutoSignin(_config).init();
                     }
                 }
             }
         ];
     };

     return MobileFacebookAutosigninTest;
});