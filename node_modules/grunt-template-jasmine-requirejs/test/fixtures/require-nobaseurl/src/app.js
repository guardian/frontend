define(function() {

  var started = false;

  return {
    fixture: 'require-nobaseurl',
    start: function() {
      started = true;
    },
    isStarted: function() {
      return started;
    }
  };
});
