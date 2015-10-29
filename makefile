# trying this out under-the-radar as a framework-agnostic
# build/install etc commands for frontend.
# feel free to use it, but it may change/disappear

default:
	@node dev/message.js describeMakefile

prod-build:
	@grunt compile

dev-build:
	@grunt compile --dev

clean:
	@echo "Removed node_modules."

install: install-npm install-dev

install-npm:
	@npm prune && npm install

clean-npm:
	@rm -rf node_modules

install-dev:
	@cd dev && npm prune && npm install

clean-dev:
	@rm -rf dev/node_modules

reinstall: clean install

test:
	@grunt test --dev

validate:
	@grunt validate

watch: dev-build
	@cd dev && make watch
