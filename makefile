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

# Add phony targets
.PHONY: sbt


# *********************** SETUP ***********************

# Install all 3rd party dependencies.
install: check-node-env
	@yarn -s install
	@./tools/sync-githooks.js

# Remove all 3rd party dependencies.
uninstall: # PRIVATE
	@rm -rf node_modules
	@echo 'All 3rd party dependencies have been uninstalled.'

# Reinstall all 3rd party dependencies from scratch.
# The nuclear option if `make install` hasn't worked.
reinstall: uninstall install

# Make sure the local node env is up to scratch.
check-node-env: # PRIVATE
	@./tools/check-node-env.js

# *********************** DEVELOPMENT ***********************

# Watch and automatically compile/reload all JS/SCSS.
# Uses port 3000 insead of 9000.
watch: compile-watch
	@./dev/watch.js

sbt: # PRIVATE
	./sbt

# *********************** ASSETS ***********************

# Compile all assets in production.
compile: install
	@NODE_ENV=production ./tools/task-runner/runner compile

# Compile all assets in development.
compile-dev: install
	@NODE_ENV=development ./tools/task-runner/runner compile --dev

# Compile atom-specific JS
compile-atoms: install
	@./tools/task-runner/runner compile/javascript/index.atoms

# Compile all assets for watch.
compile-watch: install # PRIVATE
	@NODE_ENV=development ./tools/task-runner/runner compile/index.watch

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

# *********************** CHECKS ***********************

# Run the JS test suite.
test: install
	@./tools/task-runner/runner test/javascript --verbose

# Run the modern JS test suite in watch mode.
test-watch: install
	@yarn test -- --watch --coverage

# Check the JS test suite coverage.
coverage: install
	@./tools/task-runner/runner test/javascript/coverage --stdout

# Validate all assets.
validate: install
	@./tools/task-runner/runner validate --verbose

# Validate all SCSS.
validate-sass: install # PRIVATE
	@./tools/task-runner/runner validate/sass --verbose

# Validate all JS.
validate-javascript: install # PRIVATE
	@./tools/task-runner/runner validate/javascript

# Fix JS linting errors.
fix: install
	@./tools/task-runner/runner validate/javascript-fix

# Fix committed JS linting errors.
fix-commits: install
	@./tools/task-runner/runner validate-head/javascript-fix

validate-a11y: install # PRIVATE
	@./tools/task-runner/runner validate/a11y

# Take screenshots for a visual check.
screenshots: install
	@./tools/task-runner/runner screenshot

# *********************** COMMERCIAL ***********************
# Do all the commercial things
commercial: install
	@./tools/task-runner/runner commercial --verbose

commercial-compile: install # PRIVATE
	@./tools/task-runner/runner commercial/compile

commercial-validate: install # PRIVATE
	@./tools/task-runner/runner commercial/validate

commercial-graph: install # PRIVATE
	@./tools/task-runner/runner commercial/graph --verbose

commercial-watch: commercial-compile
	@./dev/commercial.watch.js

commercial-dev:
	@yarn webpack-dev-server -c ./webpack.config.commercial.dev.js
