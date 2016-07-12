default: help

watch: compile-dev
	@npm run sass-watch & \
		npm run css-watch & \
		npm run browser-sync

compile: clean-assets
	@grunt compile-assets

compile-dev: clean-assets
	@grunt compile-assets --dev

install:
	@echo 'Installing 3rd party dependencies…'
	@npm install
	@echo '…done.'
	@echo 'Removing any unused 3rd party dependencies…'
	@npm prune
	@echo '…done.'
	@node tools/messages.js install

reinstall: uninstall install

uninstall:
	@rm -rf node_modules
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
