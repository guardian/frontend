// @flow
import bonzo from 'bonzo';
import { getBreakpoint } from 'lib/detect';

/**
 * All the football snaps sitting in a "big" slice (if any) will take the height of their trail trails
 */
export const resizeForFootballSnaps = (el: bonzo): void => {
    if (el && getBreakpoint() !== 'mobile') {
        const $el = bonzo(el);
        $el.css('height', $el.parent().css('height'));
    }
};
