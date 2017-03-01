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
watch: compile-watch
	@./dev/watch.js

# *********************** ASSETS ***********************

# Compile all assets in production.
compile: install
	@./tools/task-runner/runner compile

# Compile all assets in development.
compile-dev: install
	@./tools/task-runner/runner compile --dev

# Compile all assets for watch.
compile-watch: install # PRIVATE
	@./tools/task-runner/runner compile/index.watch

compile-javascript: install # PRIVATE
	@./tools/task-runner/runner compile/javascript

compile-javascript-dev: install # PRIVATE
	@./tools/task-runner/runner compile/javascript --dev

compile-css: install # PRIVATE
	@./tools/task-runner/runner compile/css

compile-images: install # PRIVATE
	@./tools/task-runner/runner compile/images

compile-svgs: install # PRIVATE
	@./tools/task-runner/runner compile/inline-svgs

compile-fonts: install # PRIVATE
	@./tools/task-runner/runner compile/fonts

# * Not ready for primetime use yet... *
pasteup: install # PRIVATE
	@cd static/src/stylesheets/pasteup && npm --silent i && node publish.js



# *********************** CHECKS ***********************

# Run the JS test suite.
test: install
	@./tools/task-runner/runner test/javascript --verbose

# Check the JS test suite coverage.
coverage: install
	@./tools/task-runner/runner test/javascript/coverage --stdout

# Lint all assets.
validate: install
	@./tools/task-runner/runner lint --verbose

# Lint all SCSS.
validate-sass: install # PRIVATE
	@./tools/task-runner/runner lint/sass --verbose

# Lint all JS.
validate-javascript: install # PRIVATE
	@./tools/task-runner/runner lint/javascript

# Lint all assets.
fix: install
	@./tools/task-runner/runner lint/javascript-fix

validate-amp: install # PRIVATE
	@cd tools/amp-validation && npm install && NODE_ENV=dev node index.js

# Take screenshots for a visual check.
screenshots: install
	@./tools/task-runner/runner screenshot



# *********************** MISC ***********************

es6: install
	@node ./tools/es5to6.js
