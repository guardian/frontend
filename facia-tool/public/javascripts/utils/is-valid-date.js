define([], function() {
  return function(date) {
    return Object.prototype.toString.call(date) === '[object Date]' ? !isNaN(date.getTime()) : false;
  };
});
