define([
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/onward/right-hand-component-factory'
], function(
        detect,
        mediatory,
        RightHandComponentFactory
   ) {

   var RecommendedRighHand = function() {

       var self = this;

       this.id = 'RecommendedRightHand';
       this.expiry = '2014-03-17';
       this.audience = 0.3;
       this.audienceOffset = 0.7;
       this.description = 'Embeds the outbrain library on the page and for the tests uses their api to populate the right-hand menu';
       this.canRun = function(config) {
          return true;
       };

       this.variants = [
           {
               id: 'control',
               test: function(context, config) {
                   require(['js!gravity'], function(){});
               }
           },
           {
               id: 'show-gravity-recommendations',
               test: function(context, config) {
                   RightHandComponentFactory.setRecommendationsSource('gravity');
                   require(['js!gravity'], function(){});
               }
           },
           {
               id: 'show-outbrain-recommendations',
               test: function(context, config) {
                   RightHandComponentFactory.setRecommendationsSource('outbrain');
               }
           }
       ];
   };

   return RecommendedRighHand;

});
