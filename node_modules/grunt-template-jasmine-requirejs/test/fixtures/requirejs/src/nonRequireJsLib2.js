(function(root) {

  var lib = root.nonRequireJsLib2 = {};

  lib.noConflict = function () {
    delete root.nonRequireJsLib2;
    return this;
  };

})(this);
