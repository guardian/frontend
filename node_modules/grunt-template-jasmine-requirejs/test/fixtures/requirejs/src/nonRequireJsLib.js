(function(root) {

  var lib = root.nonRequireJsLib = {};

  lib.noConflict = function () {
    delete root.nonRequireJsLib;
    return this;
  };

})(this);
