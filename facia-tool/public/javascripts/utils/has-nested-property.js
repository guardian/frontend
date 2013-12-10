define(function() {
    return function (obj, path) {
        if(obj.hasOwnProperty(path[0])) {
            return path.length === 1 ? true : this.hasNestedProperty(obj[path[0]], _.rest(path));
        }
        return false;
    };
});
