default: help

watch: compile-dev
	@cd dev && make watch

compile:
	@grunt compile-assets

compile-dev:
	@grunt compile-assets --dev

install: install-application install-dev
	@node dev/message.js install

reinstall: clean install

clean: clean-application clean-dev
	@echo 'All 3rd party dependencies have been uninstalled.'

test:
	@grunt test --dev

validate:
	@grunt validate


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

clean-application:
	@rm -rf node_modules

install-dev:
	@echo 'Removing any unused dev packages…'
	@cd dev && npm prune
	@echo '…done.'
	@echo 'Installing dev packages…'
	@cd dev && npm install
	@echo '…done.'

clean-dev:
	@rm -rf dev/node_modules
