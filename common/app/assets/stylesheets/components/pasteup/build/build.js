module.exports = function(grunt) {

	var async	= require('async'),
  		fs		= require('fs');

  var version = grunt.config.get("pasteup.version").toString();

	function buildDocumentationPages(cb) {
	  var template = grunt.file.read('build/templates/default.html');
	  async.forEach(fs.readdirSync('docs'), function(name, cb) {
	    var ft = grunt.file.read('docs/' + name, 'utf8');
	    var f = grunt.template.process(ft.toString(), { data: {'pasteupVersion': version} });
	    var output = grunt.template.process(template, { data: {'name':name, 'code':ft, 'pasteupVersion': version} });
	    grunt.file.write('build/deployable_artefact/' + name, output);
	    cb();
	  }, function() {
	    cb();
	  });
	}

	function buildModuleLibrary(cb) {
	  var modules = [];
	  var template = grunt.file.read('build/templates/library.html');
	  async.forEach(fs.readdirSync('html/module'), function(name, cb) {
	    var module = grunt.file.read('html/module/' + name, 'utf8');
	    modules.push({
	      'name': name,
	      'code': module
	    });
	    cb();
	  }, function() {
	    // Render modules into template.
	    var output = grunt.template.process(template, { data: {'modules': modules, 'pasteupVersion': version} });
	    grunt.file.write('build/deployable_artefact/modules.html', output);
	    cb();
	  });
	}

	function buildModulePages(cb) {
	  var template = grunt.file.read('build/templates/module.html');

	  // Get each module and create its own page in the docs.
	  async.forEach(fs.readdirSync('html/module'), function(name, cb) {
	    var module = grunt.file.read('html/module/' + name, 'utf8');
	    var output = grunt.template.process(template, { data: {'name': name, 'code': module, 'pasteupVersion': version} });
	    grunt.file.write('build/deployable_artefact/modules/' + name, output);
	    cb();
	  }, function() {
	    cb();
	  });
	}

  grunt.registerTask('docs', 'Build the documentation pages.', function() {
    grunt.log.subhead('Building documentation pages');
    grunt.file.mkdir("build/deployable_artefact/modules");

    async.parallel([
      buildDocumentationPages,
      buildModuleLibrary,
      buildModulePages
    ], function(err, results) {
      grunt.log.writeln('Docs build complete.');
    });
  });


}

