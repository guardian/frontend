.PHONY: boosh test

boosh:
	@node -e "var json = require('./build');json.JSHINT_OPTS=JSON.parse(require('fs').readFileSync('./.jshintrc'));require('fs').writeFileSync('./build.json', JSON.stringify(json, null, 2))"
	@node_modules/smoosh/bin/smoosh make build.json

test:
	npm test