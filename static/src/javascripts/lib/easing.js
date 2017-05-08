// @flow

/* Create basic easing functions

   Usage:
     var ease = easing.createEasing('easeOutQuint', 3000); // createEasings a 3 second duration easing function
     ease(); // each call will return a value from 0 (at t=0) to 1.0 (at t>=duration)

   https://gist.github.com/gre/1650294
*/

const easeIn = (power: number): Function => t => t ** power;

const easeOut = (power: number): Function => t =>
    1 - Math.abs((t - 1) ** power);

const easeInOut = (power: number): Function => t =>
    t < 0.5 ? easeIn(power)(t * 2) / 2 : easeOut(power)(t * 2 - 1) / 2 + 0.5;

// #? these probably should not be generated on parse but on being called
const easingFunctions = {
    // no easing, no acceleration
    linear: easeInOut(1),

    // accelerating from zero velocity
    easeInQuad: easeIn(2),

    // decelerating to zero velocity
    easeOutQuad: easeOut(2),

    // acceleration until halfway, then deceleration
    easeInOutQuad: easeInOut(2),

    // accelerating from zero velocity
    easeInCubic: easeIn(3),

    // decelerating to zero velocity
    easeOutCubic: easeOut(3),

    // acceleration until halfway, then deceleration
    easeInOutCubic: easeInOut(3),

    // accelerating from zero velocity
    easeInQuart: easeIn(4),

    // decelerating to zero velocity
    easeOutQuart: easeOut(4),

    // acceleration until halfway, then deceleration
    easeInOutQuart: easeInOut(4),

    // accelerating from zero velocity
    easeInQuint: easeIn(5),

    // decelerating to zero velocity
    easeOutQuint: easeOut(5),

    // acceleration until halfway, then deceleration
    easeInOutQuint: easeInOut(5),
};

const createEasing = (type: string, duration: number): Function => {
    const startTime = new Date();
    const ease = easingFunctions[type];

    return () => {
        const elapsed = new Date() - startTime;
        return ease(Math.min(1, elapsed / duration));
    };
};

export { easingFunctions, createEasing };
