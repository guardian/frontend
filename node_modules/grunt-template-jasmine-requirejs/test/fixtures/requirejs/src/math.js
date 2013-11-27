define(['sum', 'module'], function(sum, module) {
  return {
    sum: sum,
    getDescription: function() {
      return module.config().description;
    }
  }
});