define([
    'bonzo'
], function(
    bonzo
){
    var FootballSnaps = {
        /**
         * All the football snaps sitting in a "big" slice (if any) will take the height of their trail trails
         */
        resizeIfPresent: function(el){
            var $el = !!el && bonzo(el),
                parent = !!el && $el.parent();

            if(parent){
                $el.css({
                    height: parent.css('height')
                });

            }
        }
    };

    return FootballSnaps;
});