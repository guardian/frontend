# trying this out under-the-radar as a framework-agnostic
# build/install etc commands for frontend.

install:
	npm prune && npm install
	cd node_modules/.bin; ./jspm install && ./jspm dl-loader && ./jspm clean
	grunt uglify:conf

test:
	grunt test --dev
