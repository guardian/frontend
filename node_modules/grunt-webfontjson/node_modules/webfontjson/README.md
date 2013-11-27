# webfontjson
Turn a set of web font files into JSON.

You probably want to run in using the associated grunt plugin: https://github.com/ahume/grunt-webfontjson

## Why?
Sometimes you want more control over when and how web fonts are loaded in to your page. Sometimes you want to cache them in localStorage or indexedDB, decide exactly which point they are applied to the page, etc… That's difficult when you simply download a font file.

## How?
The package comes with an executable command, webfontjson

    npm install -g webfontjson
    webfontjson /path/to/config.json
    
Everything else is configured in a configuration file. Here's an example:

    [{
		"filename": "/my-project/json-fonts/MyriadPro.otf.json",
		"callback": "fontsLoadedCallback",
		"fonts": [
			{
				"font-family": "WebFont-MyriadPro",
				"font-weight": "normal",
				"file": "/Library/Fonts/MyriadPro-Regular.otf",
				"format": "otf"
			},
			{
				"font-family": "WebFont-MyriadPro",
				"font-weight": "bold",
				"font-style": "italic",
				"file": "/Library/Fonts/MyriadPro-Bold.otf",
				"format": "otf"
			}
		]
	}]
	
The config is an array of files to create. It contains fields for the filename, the name of a callback function to wrap the JSON in, and a list of fonts to include in the file.

Each font in the list can contain the following values for a particular `@font-face` rule.

 * `font-family` (required)
 * `format` (required)
 * `file` (required)
 * `font-weight`
 * `font-style`
 * `font-stretch`
 * `unicode-range`
 * `font-variant`
 * `font-feature-settings`

 For each font, the appropriate `@font-face` rule will be created and wrapped in a JSON wrapper for delivery into a web browser. 
