'use strict';

var fs      = require('fs');
var exec 	= require('child_process').exec;

var mimeTypes = {
	'woff': 'application/x-font-woff',
	'ttf' : 'font/opentype',
	'otf' : 'font/opentype',
	'eot' : 'application/vnd.ms-fontobject'
}

function buildFontFaceRule(fonts) {
	var css = '';
	fonts.forEach(function(font) {
		css += '@font-face{font-family:' + font['font-family'] + ';';
		css += 'src:url(data:' + mimeTypes[font.format] + ';base64,' + font.base64 + ');';
		// Check for allowed @font-face properties.
		[
			'font-weight',
			'font-style',
			'font-stretch',
			'font-variant',
			'font-feature-settings',
			'unicode-range'
		].forEach(function(prop) {
			css += (font[prop]) ? prop + ':' + font[prop] + ';' : '';
		});
		css += '}';
	});
	return css;
}

function createFontFile(fontJson, callback) {

	var callbacks = 0;
	fontJson.fonts.forEach(function(font) {
		fs.readFile(font.file, 'utf8', function(e, data) {
			console.log('Reading file: ' + font.file);

			// I tried lots of things to buffer the binary input, and encode to base64 within node.
			// None of them came out as valid font-files, so I'm falling back to what I run on the CLI, which works (on my machine!)
			exec("openssl base64 < " + font.file + " | tr -d '\n'", function(error, stdout, stderr) {
				if (!error && !stderr && stdout) {
					font.base64 = stdout;

					callbacks++;
					if (callbacks === fontJson.fonts.length) {
						var fileJson = {
							'name': font['font-family'],
							'css': buildFontFaceRule(fontJson.fonts)
						}
						var out = fontJson['callback'] + '(' + JSON.stringify(fileJson) + ');';
						fs.writeFileSync(fontJson['filename'], out);
						callback(fontJson['filename']);
					}
				} else {
					console.log("Encoding failed.");
					console.log(error, stderr);
				}
			});
		});
	});
}

function buildFontFiles(fontListJson, callback) {
	var callbacks = 0;
	fontListJson.forEach(function(fontFile) {
		createFontFile(fontFile, function(filename) {
			console.log('Created file: ', filename);
			callbacks++;
			if (callbacks === fontListJson.length) {
				callback();
			}
		})
	})
}

module.exports = {
	buildFontFiles: buildFontFiles,
	buildFontFaceRule: buildFontFaceRule
}