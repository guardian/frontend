default: help

watch: compile-dev
	@./node_modules/grunt-sass/node_modules/node-sass/bin/node-sass -w ./static/src/stylesheets -o ./static/target/stylesheets --source-map=true & \
		./node_modules/.bin/gulp --cwd ./dev watch:css & \
		./node_modules/browser-sync/bin/browser-sync.js start --config ./dev/bs-config.js

compile: clean-assets
	@grunt compile-assets

compile-dev: clean-assets
	@grunt compile-assets --dev

install:
	@echo 'Installing 3rd party dependencies…'
	@npm install
	@cd static/src/deploys-radiator && npm install && node_modules/.bin/jspm install && node_modules/.bin/tsd install
	@echo '…done.'
	@echo 'Removing any unused 3rd party dependencies…'
	@npm prune
	@cd static/src/deploys-radiator && node_modules/.bin/jspm clean && npm prune
	@echo '…done.'
	@node tools/messages.js install

reinstall: uninstall install

uninstall:
	@rm -rf node_modules
	@cd static/src/deploys-radiator && rm -rf node_modules jspm_packages typings
	@echo 'All 3rd party dependencies have been uninstalled.'

test:
	@grunt test --dev

validate:
	@grunt validate

validate-sass:
	@grunt validate:sass
	@grunt validate:css

validate-js:
	@grunt validate:js

shrinkwrap:
	@npm shrinkwrap --dev && node dev/clean-shrinkwrap.js
	@node tools/messages.js did-shrinkwrap

clean-assets:
	@rm -rf static/target static/hash static/requirejs

pasteup:
	@cd static/src/stylesheets/pasteup && npm --silent i && node publish.js


# internal targets
help:
	@node tools/messages.js describeMakefile
