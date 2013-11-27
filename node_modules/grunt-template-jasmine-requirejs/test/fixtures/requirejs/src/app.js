define(function() {

  var started = false;

  return {
    start: function() {
      started = true;
    },
    isStarted: function() {
      return started;
    }
  }
});
