/**
 * This avoids having to new up Date objects in code making it easier to test date/time dependent code
 */
define([], function() {
    return {
        /**
         * Constructs a Date object
         * @return {?Date} the current date
         */
        currentDate : function () {
           return new Date();
        }
    };
});