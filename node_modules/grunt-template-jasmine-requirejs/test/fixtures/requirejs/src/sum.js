define(['module'], function(module) {
  var sum = function(a, b) {
    return a + b;
  };
  sum.getDescription = function() {
    return module.config().description;
  };
  return sum;
});