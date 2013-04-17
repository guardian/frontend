module.exports = function(grunt) {

  //Register custom task for running server.
  var connect = require('connect');
  grunt.registerTask('server', 'Start a static web server on localhost:3000', function() {
    grunt.log.subhead('Starting development server');
    grunt.log.writeln('Port: 3000');
    connect(connect.static(grunt.config.get('pasteup.dist'))).listen(3000);
    //this.async(); // Leave the server running.
  });
}