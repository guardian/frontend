define(function() {

  var started = false;

  return {
    fixture: 'require-baseurl',
    start: function() {
      started = true;
    },
    isStarted: function() {
      return started;
    }
  };
});
