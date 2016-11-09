# Targets marked '# PRIVATE' will be hidden when running `make help`.
# They're helper targets that you probably only need to know about
# if you've got as far as reading the makefile.

# Lists common tasks.
# Also the default task (`make` === `make help`).
help:
	@node tools/messages.js describeMakefile

# Lists *all* targets.
list: # PRIVATE
	@node tools/messages.js describeMakefile --all



# *********************** SETUP ***********************

# Install all 3rd party dependencies.
install: check-node check-yarn
	@yarn install

# Remove all 3rd party dependencies.
uninstall: # PRIVATE
	@rm -rf node_modules
	@echo 'All 3rd party dependencies have been uninstalled.'

# Reinstall all 3rd party dependencies from scratch.
# The nuclear option if `make install` hasn't worked.
reinstall: uninstall install

# Make sure we running a recent-enough version of Node.
check-node: # PRIVATE
	@./tools/check-node-version.js

# Make sure yarn is installed, and it's at least v0.16.
check-yarn: # PRIVATE
	@if [ -z "$$(which yarn)" ] || [ $$(echo $$(yarn --version | cut -d . -f 1,2) '< 0.16' | bc) = 1 ]; then npm i -g yarn@\$<=0.16; fi

# *********************** DEVELOPMENT ***********************

# Watch and automatically compile/reload all JS/SCSS.
# Uses port 3000 insead of 9000.
watch: compile-dev
	@npm run sass-watch & \
		npm run css-watch & \
		npm run browser-sync



# *********************** ASSETS ***********************

# Compile all assets for production.
compile: check-node
	@./tools/run-task compile

# Compile all assets for development.
compile-dev: check-node
	@./tools/run-task compile --dev

compile-javascript: check-node # PRIVATE
	@./tools/run-task compile/javascript

compile-javascript-dev: check-node # PRIVATE
	@./tools/run-task compile/javascript --dev

compile-css: check-node # PRIVATE
	@./tools/run-task compile/css

compile-images: check-node # PRIVATE
	@./tools/run-task compile/images

compile-svgs: check-node # PRIVATE
	@./tools/run-task compile/inline-svgs

compile-fonts: check-node # PRIVATE
	@./tools/run-task compile/fonts

atomise-css: check-node # PRIVATE
	@node tools/atomise-css

# * Not ready for primetime use yet... *
pasteup: check-node # PRIVATE
	@cd static/src/stylesheets/pasteup && npm --silent i && node publish.js



# *********************** CHECKS ***********************

# Run the JS test suite.
test: check-node
	@./tools/run-task test/javascript

# Check the JS test suite coverage.
coverage: check-node
	@./tools/run-task test/javascript/coverage --stdout

# Lint all assets.
validate: check-node
	@./tools/run-task lint

# Lint all SCSS.
validate-sass: check-node # PRIVATE
	@./tools/run-task lint/sass

# Lint all JS.
validate-javascript: check-node # PRIVATE
	@./tools/run-task lint/javascript

validate-amp: check-node # PRIVATE
	@cd tools/amp-validation && npm install && NODE_ENV=dev node index.js
