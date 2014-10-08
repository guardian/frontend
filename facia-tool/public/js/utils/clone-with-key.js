define([
    'utils/clean-clone'
], function(
    cleanClone
) {
    return function (obj, id) {
        var nuObj = obj ? cleanClone(obj) : {};
        nuObj.id = id;
        return nuObj;
    };
});
