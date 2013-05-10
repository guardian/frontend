.PHONY: release

boosh:
	@node -e "var json = require('./make/build');json.JSHINT_OPTS=JSON.parse(require('fs').readFileSync('./.jshintrc'));require('fs').writeFileSync('./make/build.json', JSON.stringify(json, null, 2))"
	@node_modules/smoosh/bin/smoosh make make/build.json

# for repo owners only
release:
	node make/release.js