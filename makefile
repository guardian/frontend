default:
	@node dev/message.js describeMakefile

watch: build-dev
	@cd dev && make watch

build:
	@grunt compile

build-dev:
	@grunt compile --dev

install: install-npm install-dev
	@node dev/message.js install

reinstall: clean install

clean: clean-npm clean-dev
	@echo 'All 3rd party dependencies have been uninstalled.'

test:
	@grunt test --dev

validate:
	@grunt validate


# internal targets

install-npm:
	@echo 'Removing any unused application packages…'
	@npm prune
	@echo '…done.'
	@echo 'Installing application packages…'
	@npm install
	@echo '…done.'

clean-npm:
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
