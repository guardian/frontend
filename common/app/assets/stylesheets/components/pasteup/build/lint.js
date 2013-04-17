var jshint    = require('jshint').JSHINT,
    csslint   = require('csslint').CSSLint,
    fs        = require('fs'),
    wrench	  = require('wrench'),
    njson	  = require('norris-json').make();

var BASE_DIR			= __dirname + '/..',
	ARTEFACT_DIR		= __dirname + '/tmp_artefact';

var lint = {

	lintJavaScript: function () {
        var config_json = njson.loadSync('jshint_config.json'); // Using njson because it strips comments from JSON file.
        wrench.readdirSyncRecursive(BASE_DIR + '/js').forEach(function(name) {
            if (name.indexOf('lib/') !== 0 &&
                name.indexOf('.min.js') === -1 &&
                name.indexOf('.js') !== -1) {
                var f = fs.readFileSync(BASE_DIR + '/js/' + name, 'utf8');
                var result = jshint(f, config_json);
                if (result === false) {
                    console.log('\nFile:  ',name);
                    console.log("------------------------");
                    lint.printJSHintErrors(jshint.errors);
                }
            }
        })
    },

    lintCss: function() {
        var config_json = njson.loadSync('csslint_config.json'); // Using njson because it strips comments from JSON file.
        wrench.readdirSyncRecursive(ARTEFACT_DIR + '/css').forEach(function(name) {
            var f = fs.readFileSync(ARTEFACT_DIR + '/css/' + name, 'utf8');
            var result = csslint.verify(f, config_json);
            console.log(name);
            console.log(result);
        });
    },

    printJSHintErrors: function(errors) {
    	for (var i = 0, j = errors.length; i<j; ++i) {
    		var error = errors[i];
    		console.log('Error: ', error.reason);
    		console.log('        Line: ', error.line);
    		console.log('        Char: ', error.character);
    	}
    }
}

module.exports = lint;

if (!module.parent) {
	lint.lintJavaScript();
	lint.lintCss();
}