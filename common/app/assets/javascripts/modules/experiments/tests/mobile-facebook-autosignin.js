define([
    "utils/detect",
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
         this.description = 'Performs facebook auto-signin on mobile where the user has already authenticated the guardian facebook app';
         this.canRun = function(config) {
             _config = config;
             return config.switches && config.switches.facebookAutosignin && Detect.getBreakpoint() === 'mobile';
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