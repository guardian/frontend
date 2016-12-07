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

# Make sure yarn is installed, at the right version.
check-yarn: # PRIVATE
	@./tools/check-yarn.js

# *********************** DEVELOPMENT ***********************

# Watch and automatically compile/reload all JS/SCSS.
# Uses port 3000 insead of 9000.
watch: compile-dev
	@npm run sass-watch & \
		npm run css-watch & \
		npm run browser-sync



# *********************** ASSETS ***********************

# Compile all assets for production.
compile: install
	@./tools/run-task compile

# Compile all assets for development.
compile-dev: install
	@./tools/run-task compile --dev

compile-javascript: install # PRIVATE
	@./tools/run-task compile/javascript

compile-javascript-dev: install # PRIVATE
	@./tools/run-task compile/javascript --dev

compile-css: install # PRIVATE
	@./tools/run-task compile/css

compile-images: install # PRIVATE
	@./tools/run-task compile/images

compile-svgs: install # PRIVATE
	@./tools/run-task compile/inline-svgs

compile-fonts: install # PRIVATE
	@./tools/run-task compile/fonts

atomise-css: install # PRIVATE
	@./tools/run-task compile/css/atomise

# * Not ready for primetime use yet... *
pasteup: install # PRIVATE
	@cd static/src/stylesheets/pasteup && npm --silent i && node publish.js



# *********************** CHECKS ***********************

# Run the JS test suite.
test: install
	@./tools/run-task test/javascript

# Check the JS test suite coverage.
coverage: install
	@./tools/run-task test/javascript/coverage --stdout

# Lint all assets.
validate: install
	@./tools/run-task lint

# Lint all SCSS.
validate-sass: install # PRIVATE
	@./tools/run-task lint/sass

# Lint all JS.
validate-javascript: install # PRIVATE
	@./tools/run-task lint/javascript

# Lint all assets.
fix: install
	@./tools/run-task lint/javascript-fix

validate-amp: install # PRIVATE
	@cd tools/amp-validation && npm install && NODE_ENV=dev node index.js
