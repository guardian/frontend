/* global _: true */
define([
    'utils/clean-clone'
], function(
    cleanClone
) {
    return function (obj, id) {
        var nuObj = cleanClone(obj);
        nuObj.id = id;
        return nuObj;
    };
});
