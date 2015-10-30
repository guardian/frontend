default: help

watch: compile-dev
	@cd dev && make watch

compile:
	@grunt compile-assets

compile-dev:
	@grunt compile-assets --dev

install: install-application install-dev
	@node dev/message.js install

reinstall: uninstall install

uninstall: uninstall-application uninstall-dev
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
	@npm shrinkwrap && node dev/clean-shrinkwrap.js
	@node dev/message.js shrinkwrap


# internal targets

help:
	@node dev/message.js describeMakefile

install-application:
	@echo 'Removing any unused application packages…'
	@npm prune
	@echo '…done.'
	@echo 'Installing application packages…'
	@npm install
	@echo '…done.'

uninstall-application:
	@rm -rf node_modules

install-dev:
	@echo 'Removing any unused dev packages…'
	@cd dev && npm prune
	@echo '…done.'
	@echo 'Installing dev packages…'
	@cd dev && npm install
	@echo '…done.'

uninstall-dev:
	@rm -rf dev/node_modules
