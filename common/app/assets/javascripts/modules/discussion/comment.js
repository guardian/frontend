define([], function() {


/**
 * @constructor
 */
var Comment = function(context) {
    this.context = context;
};

/**
 * @return {number}
 */
Comment.prototype.getId = function() {
    return 1;
};


return Comment;

}); //define