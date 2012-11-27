// Initialisation
var src = require('fs').readFileSync(process.argv[2], 'utf8'),
	sys = require('sys'),
	jshint = require('./jshint').JSHINT,
	i = null,
	e = null,
	result = jshint(src, {
		browser: true,
		curly: true,
		eqeqeq: true,
		immed: true,
		noempty: true,
		onevar: true,
		plusplus: true
	});

// Check for errors
if(!result) {
	sys.puts('');
	
	// It's the end of the world!
	for(i = 0; i < jshint.errors.length; i++) {
		// Log the error
		e = jshint.errors[i];
		sys.puts('[' + e.line + ':' + e.character + '] ' + e.id + ' ' + e.reason + "\n\n\t" + e.evidence + "\n");
	}
}