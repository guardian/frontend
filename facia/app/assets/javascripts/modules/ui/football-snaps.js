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
            if(!!el){
                var $el = bonzo(el),
                    $parent = $el.parent();

                if(parent.length !== 0){
                    $el.css('height', $parent.css('height'));
                }
            }
        }
    };

    return FootballSnaps;
});