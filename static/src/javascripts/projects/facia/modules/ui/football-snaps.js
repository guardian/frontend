// @flow
import { getBreakpoint } from 'lib/detect';
import { $ } from 'lib/$';

/**
 * All the football snaps sitting in a "big" slice (if any) will take the height of their trail trails
 */
export const resizeForFootballSnaps = (el: $): void => {
    if (el && getBreakpoint() !== 'mobile') {
        const $el = $(el);
        $el.css('height', $el.parent().css('height'));
    }
};
