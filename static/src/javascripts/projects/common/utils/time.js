/**
 * This avoids having to new up Date objects in code making it easier to test date/time dependent code
 */
define([], function () {

    /**
     * Constructs a Date object
     * @return {?Date} the current date
     */
     function currentDate () {
        return new Date();
     }

     function isoDateFormattedString() {

        var date = new Date();
        var local = date.toString('yyyy-MM-DDTHH:MM:SS');
        var offset = date.getTimezoneOffset() / 60;
         console.log("Local: " + local +"Of" + offset);
         return local + "-" + offset + ":00";

     }

    return {
        currentDate: currentDate,
        isoDateFormattedString: isoDateFormattedString
    };
});
