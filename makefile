# trying this out under-the-radar as a framework-agnostic
# build/install etc commands for frontend.
# feel free to use it, but it may change/disappear

default:
	grunt compile

clean:
	rm -rf node_modules

install:
	npm prune && npm install
	cd dev && make install

reinstall:
	$(MAKE) clean
	$(MAKE) install

test:
	grunt test --dev

validate:
	grunt validate

watch:
	grunt compile --dev
	cd dev && make watch
