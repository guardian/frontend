define([
    'bonzo',
    'common/utils/detect'
], function (
    bonzo,
    detect
) {
    var FootballSnaps = {
        /**
         * All the football snaps sitting in a "big" slice (if any) will take the height of their trail trails
         */
        resizeIfPresent: function (el) {
            if (detect.getBreakpoint() !== 'mobile' && el) {
                var $el = bonzo(el);
                $el.css('height', $el.parent().css('height'));
            }
        }
    };

    return FootballSnaps;
});
