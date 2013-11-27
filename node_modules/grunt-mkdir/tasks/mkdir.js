
module.exports = function(grunt) {
  return grunt.registerMultiTask('mkdir', 'Make directories.', function() {
    var options;
    options = this.options({
      mode: null,
      create: []
    });
    grunt.verbose.writeflags(options, 'Options');
    return options.create.forEach(function(filepath) {
      grunt.log.write('Creating "' + filepath + '"...');
      try {
        grunt.file.mkdir(filepath, options.mode);
        return grunt.log.ok();
      } catch (e) {
        grunt.log.error();
        grunt.verbose.error(e);
        return grunt.fail.warn('Mkdir operation failed.');
      }
    });
  });
};
