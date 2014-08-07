define([
    'bonzo',
    'common/utils/$'
], function(
    bonzo,
    $
){
    function findParentByClassName(elem, cssClass){
        var $elem = bonzo(elem);
        if($elem[0]){
            if($elem.hasClass(cssClass)) return elem;
            else return findParentByClassName($elem.parent(), cssClass);
        }
        return false;
    }

    var FootballSnaps = {
    
        /**
         * All the football snaps sitting in a "big" slice (if any) will take the height of their trail trails
         */
        resizeIfPresent: function(el){
            var $el = !!el && bonzo(el),
                parent = !!el && findParentByClassName($el, "row-of-two"),
                trail = !!parent && $('.facia-slice__item:not(.facia-snap)', parent);

            if(trail){
                $el.css({
                    height: trail.css('height')
                })

            }
        }
    }

    return FootballSnaps
});